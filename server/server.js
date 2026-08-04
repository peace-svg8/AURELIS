require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const Redis = require('ioredis');
const { Resend } = require('resend');

// Prisma client initialization
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

// Resend initialization
const resend = new Resend(process.env.RESEND_API_KEY);

// Redis initialization (graceful fallback if REDIS_URL is not provided)
let redis = null;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
  redis.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });
  redis.on('connect', () => {
    console.log('Successfully connected to Redis');
  });
} else {
  console.log('No REDIS_URL found. Proceeding without cache (Database only).');
}

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. CORS (Restrict to frontend domain)
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// 3. Rate Limiting (Prevent DDoS/spam)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', apiLimiter);

// 4. Logging
app.use(morgan('combined'));
app.use(express.json());

// --- Endpoints ---

// Health Check Endpoint
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    let redisStatus = 'disconnected';
    if (redis && redis.status === 'ready') {
      redisStatus = 'connected';
    } else if (!redis) {
      redisStatus = 'disabled';
    }
    res.status(200).json({ status: 'UP', database: 'connected', redis: redisStatus });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'DOWN', database: 'disconnected' });
  }
});

// Get Watches Catalog (with Redis Caching)
app.get('/api/watches', async (req, res) => {
  try {
    // 1. Try to fetch from Redis Cache
    if (redis && redis.status === 'ready') {
      const cachedWatches = await redis.get('watches_catalog');
      if (cachedWatches) {
        return res.json({ success: true, source: 'cache', watches: JSON.parse(cachedWatches) });
      }
    }

    // 2. Cache Miss -> Fetch from Database
    const watches = await prisma.watch.findMany({
      orderBy: { id: 'asc' }
    });

    // 3. Store in Redis for future requests (expire in 1 hour)
    if (redis && redis.status === 'ready') {
      await redis.set('watches_catalog', JSON.stringify(watches), 'EX', 3600);
    }

    res.json({ success: true, source: 'database', watches });
  } catch (error) {
    console.error('Failed to fetch watches:', error);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

app.get('/api', (req, res) => {
  res.json({ message: 'Aurelis Backend API is running securely' });
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Endpoint to place an order (with secure price verification)
app.post('/api/orders', 
  [
    body('customer.fullName').trim().notEmpty().withMessage('Full name is required'),
    body('customer.email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('customer.address').trim().notEmpty().withMessage('Address is required'),
    body('customer.city').trim().notEmpty().withMessage('City is required'),
    body('customer.zipCode').trim().notEmpty().withMessage('Zip code is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required in the order')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { items, customer } = req.body;

      // Extract requested watch IDs
      const watchIds = items.map(item => item.id.toString());
      
      // Query the database for the real prices of these watches
      const realWatches = await prisma.watch.findMany({
        where: { id: { in: watchIds } }
      });

      // Build a lookup map: { "1": 1899, "2": 1499 }
      const truePriceMap = {};
      realWatches.forEach(w => {
        truePriceMap[w.id] = w.price;
      });

      let secureTotalAmount = 0;
      const validOrderItems = [];

      // Validate each item against the true database price
      for (const item of items) {
        const watchId = item.id.toString();
        const truePrice = truePriceMap[watchId];

        if (truePrice === undefined) {
          return res.status(400).json({ error: `Invalid product ID provided: ${watchId}. This item does not exist.` });
        }

        // We completely ignore the 'price' sent by the frontend
        // and calculate the total using the true database price
        secureTotalAmount += truePrice * item.quantity;

        validOrderItems.push({
          watchId: watchId,
          name: item.name,
          variant: item.variant,
          price: truePrice,
          quantity: item.quantity
        });
      }

      // Create the order
      const newOrder = await prisma.order.create({
        data: {
          customerName: customer.fullName,
          email: customer.email,
          phone: customer.phone || 'N/A',
          address: customer.address,
          city: customer.city,
          zipCode: customer.zipCode,
          country: customer.country || 'N/A',
          status: 'PENDING_PAYMENT',
          totalAmount: secureTotalAmount,
          items: {
            create: validOrderItems
          }
        },
        include: {
          items: true
        }
      });

      // --- SEND EMAIL RECEIPT ---
      if (process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: 'Aurelis Watches <onboarding@resend.dev>',
            to: customer.email,
            subject: `Order Confirmation - Aurelis (#${newOrder.id})`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #c9a96e; text-align: center;">AURELIS</h1>
                <h2>Thank you for your order, ${customer.fullName}!</h2>
                <p>We are processing your order and will notify you when it ships.</p>
                <h3>Order Summary (ID: ${newOrder.id})</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  ${validOrderItems.map(item => `
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                        <strong>${item.name}</strong> (${item.variant}) x ${item.quantity}
                      </td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">
                        $${(item.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  `).join('')}
                </table>
                <h3 style="text-align: right; color: #c9a96e; margin-top: 20px;">
                  Total: $${secureTotalAmount.toLocaleString()}
                </h3>
                <p style="margin-top: 30px; font-size: 0.9em; color: #888; text-align: center;">
                  Aurelis Luxury Watches<br>
                  ${customer.address}, ${customer.city}, ${customer.zipCode}
                </p>
              </div>
            `
          });
          console.log(`Receipt email sent to ${customer.email} for order ${newOrder.id}`);
        } catch (emailError) {
          console.error('Failed to send receipt email:', emailError);
        }
      } else {
        console.warn('RESEND_API_KEY not configured. Skipping email receipt.');
      }

      res.status(201).json({ 
        success: true, 
        message: 'Order created securely. Prices verified by database.',
        orderId: newOrder.id 
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'An error occurred while placing the order.' });
    }
});

// Endpoint for Contact Form inquiries
app.post('/api/contact', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, subject, message } = req.body;

    if (process.env.RESEND_API_KEY) {
      // NOTE: With a free Resend account, you can only send emails to the email address 
      // you verified on Resend. So the 'to' address below should ideally be your own email.
      // We are using the customer's email here just for the sake of the demo, but it might bounce 
      // if you haven't verified a domain.
      await resend.emails.send({
        from: 'Aurelis Watches <onboarding@resend.dev>',
        to: email, 
        subject: `New Inquiry: ${subject} - from ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #c9a96e;">Aurelis Contact Form Inquiry</h2>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr />
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        `
      });
      console.log(`Contact inquiry sent from ${email}`);
    } else {
      console.warn('RESEND_API_KEY not configured. Skipping contact inquiry email.');
    }

    res.status(200).json({ success: true, message: 'Your inquiry has been sent successfully.' });
  } catch (error) {
    console.error('Error sending contact inquiry:', error);
    res.status(500).json({ error: 'Failed to send inquiry.' });
  }
});

// --- ORDER TRACKING ---
app.get('/api/orders/track', async (req, res) => {
  try {
    const { email, orderId } = req.query;

    if (!email || !orderId) {
      return res.status(400).json({ error: 'Both email and order ID are required.' });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        email: email.toLowerCase()
      },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'No order found with that ID and email combination.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: 'Failed to track order.' });
  }
});

// --- ADMIN AUTH ---
const crypto = require('crypto');
const ADMIN_TOKEN = crypto.randomBytes(32).toString('hex');

app.post('/api/admin/login', [
  body('password').notEmpty().withMessage('Password is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: 'Invalid password.' });
  }
});

// Admin middleware
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  next();
};

// Admin: Get all orders
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Failed to fetch admin orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// Admin: Update order status
app.patch('/api/admin/orders/:id', requireAdmin, [
  body('status').trim().notEmpty().withMessage('Status is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['PENDING_PAYMENT', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { items: true }
    });

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order.' });
  }
});

// --- REVIEWS ---
app.get('/api/reviews/:watchId', async (req, res) => {
  try {
    const { watchId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { watchId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

app.post('/api/reviews', [
  body('watchId').trim().notEmpty().withMessage('Watch ID is required'),
  body('customerName').trim().notEmpty().withMessage('Name is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { watchId, customerName, rating, comment } = req.body;
    const review = await prisma.review.create({
      data: {
        watchId: watchId.toString(),
        customerName,
        rating: parseInt(rating),
        comment
      }
    });
    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

// --- Server Startup & Graceful Shutdown ---
const server = app.listen(PORT, () => {
  console.log(`Server running securely on http://localhost:${PORT}`);
});

const gracefulShutdown = async () => {
  console.log('Received kill signal, shutting down gracefully.');
  
  server.close(async () => {
    console.log('Closed out remaining HTTP connections.');
    try {
      await prisma.$disconnect();
      if (redis) await redis.quit();
      console.log('Database and Redis disconnected.');
      process.exit(0);
    } catch (err) {
      console.error('Error during disconnection', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
