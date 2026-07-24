require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const Redis = require('ioredis');

// Prisma client initialization
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

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
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
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
