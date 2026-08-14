import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'
import './Checkout.css'

export default function Checkout() {
  const { isCheckoutOpen, setIsCheckoutOpen, items, subtotal, clearCart } = useCart()
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', zip: '',
    cardNumber: '', expiry: '', cvv: ''
  })

  useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
      if (isSuccess || isSubmitting) {
        setIsSuccess(false)
        setIsSubmitting(false)
      }
    }
  }, [isCheckoutOpen, isSuccess])

  if (!isCheckoutOpen) return null

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return;
    setIsSubmitting(true)
    
    try {
      // Build the payload expected by our backend
      const orderPayload = {
        items: items,
        customer: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone || 'N/A', // Using fallback for now
          address: formData.address,
          city: formData.city,
          zipCode: formData.zip,
          country: formData.country || 'N/A'
        }
      };

      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const data = await response.json();
        clearCart();
        if (data.authorization_url) {
          window.location.href = data.authorization_url;
        } else {
          // Show fallback success screen if no payment url (e.g., test mode offline)
          setIsSuccess(true);
          setIsSubmitting(false);
        }
      } else {
        const data = await response.json();
        toast.error(`Failed to place order: ${data.error}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('A network error occurred while placing your order.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-content">
        <button className="close-btn" onClick={() => setIsCheckoutOpen(false)} aria-label="Close checkout">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {isSuccess ? (
          <div className="success-message">
            <div className="success-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 className="success-title">Order Confirmed</h2>
            <p className="success-desc">
              Thank you for your purchase. Your luxury timepiece is being prepared for complimentary expedited shipping. A confirmation email has been sent to {formData.email || 'your email'}.
            </p>
            <button className="btn btn-primary" onClick={() => setIsCheckoutOpen(false)}>
              Return to Collection
            </button>
          </div>
        ) : (
          <>
            <form className="checkout-form-section" onSubmit={handleSubmit}>
              <h2 className="checkout-section-title">Shipping Details</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" name="firstName" className="form-input" required onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" name="lastName" className="form-input" required onChange={handleInputChange} />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" name="email" className="form-input" required onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" name="phone" className="form-input" required onChange={handleInputChange} />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Shipping Address</label>
                <input type="text" name="address" className="form-input" required onChange={handleInputChange} />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input type="text" name="city" className="form-input" required onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Postal / Zip Code</label>
                  <input type="text" name="zip" className="form-input" required onChange={handleInputChange} />
                </div>
              </div>

              <div className="payment-section">
                <h2 className="checkout-section-title">Payment Method</h2>
                <div className="paystack-option" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div className="paystack-radio-container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="radio" checked readOnly id="paystack" name="paymentMethod" style={{ accentColor: 'var(--gold)' }} />
                    <label htmlFor="paystack" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--white)', cursor: 'pointer', margin: 0 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                        <line x1="2" y1="10" x2="22" y2="10"></line>
                      </svg>
                      Paystack (Card, Bank Transfer, USSD)
                    </label>
                  </div>
                  <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--white-muted)', lineHeight: '1.5' }}>
                    After clicking "Place Order", you will be securely redirected to Paystack to complete your purchase using your preferred payment method.
                  </p>
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary place-order-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : `Place Order — ₦${subtotal.toLocaleString()}`}
              </button>
            </form>

            <div className="checkout-summary-section">
              <h2 className="checkout-section-title">Order Summary</h2>
              
              <div className="summary-items">
                {items.map(item => (
                  <div key={`${item.id}-${item.variant}`} className="summary-item">
                    <img src={item.image} alt={item.name} className="summary-item-img" />
                    <div className="summary-item-details">
                      <h4 className="summary-item-title">{item.name}</h4>
                      <p className="summary-item-price">{item.variant} x {item.quantity}</p>
                    </div>
                    <div className="summary-item-price" style={{ alignSelf: 'center', color: 'var(--white)' }}>
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="summary-totals">
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Taxes (Estimated)</span>
                  <span>₦0.00</span>
                </div>
                <div className="cart-summary-row">
                  <span>Shipping</span>
                  <span>Complimentary</span>
                </div>
                <div className="cart-total" style={{ marginTop: '24px' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--gold)' }}>₦{subtotal.toLocaleString()}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--white-muted)', fontSize: '0.85rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span>Secure SSL encrypted payment</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
