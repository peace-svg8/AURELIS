import { useState } from 'react'
import './OrderTracking.css'

const STATUS_STEPS = ['PENDING_PAYMENT', 'PROCESSING', 'SHIPPED', 'DELIVERED']
const STATUS_LABELS = {
  PENDING_PAYMENT: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
}

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('idle') // idle, loading, error, found
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    setOrder(null)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${apiUrl}/api/orders/track?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (response.ok) {
        setOrder(data.order)
        setStatus('found')
      } else {
        setStatus('error')
        setErrorMessage(data.error || 'Order not found.')
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage('Network error. Please try again.')
    }
  }

  const getStepIndex = (orderStatus) => {
    if (orderStatus === 'CANCELLED') return -1
    return STATUS_STEPS.indexOf(orderStatus)
  }

  return (
    <div className="track-page">
      <div className="track-container">
        <a href="/" className="track-back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Store
        </a>

        <div className="track-header">
          <a href="/" className="track-logo">AURELIS</a>
          <h1>Track Your Order</h1>
          <p>Enter your order ID and email address to check the status of your order.</p>
        </div>

        <form className="track-form" onSubmit={handleSubmit}>
          <div className="track-form-row">
            <div className="track-form-group">
              <label>Order ID</label>
              <input
                type="text"
                placeholder="e.g. 1"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
            <div className="track-form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="track-submit-btn" disabled={status === 'loading'}>
            {status === 'loading' ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {status === 'error' && (
          <div className="track-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            {errorMessage}
          </div>
        )}

        {status === 'found' && order && (
          <div className="track-result">
            <div className="track-result-header">
              <div>
                <h2>Order #{order.id}</h2>
                <p className="track-date">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <span className={`track-status-badge ${order.status.toLowerCase().replace('_', '-')}`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>

            {/* Progress Stepper */}
            {order.status !== 'CANCELLED' ? (
              <div className="track-progress">
                {STATUS_STEPS.map((step, index) => {
                  const currentIndex = getStepIndex(order.status)
                  const isCompleted = index <= currentIndex
                  const isCurrent = index === currentIndex
                  return (
                    <div key={step} className={`track-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="step-dot">
                        {isCompleted && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      {index < STATUS_STEPS.length - 1 && <div className={`step-line ${index < currentIndex ? 'filled' : ''}`} />}
                      <span className="step-label">{STATUS_LABELS[step]}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="track-cancelled">
                This order has been cancelled.
              </div>
            )}

            {/* Order Items */}
            <div className="track-items">
              <h3>Items in this order</h3>
              {order.items.map(item => (
                <div key={item.id} className="track-item">
                  <div className="track-item-info">
                    <span className="track-item-name">{item.name}</span>
                    <span className="track-item-variant">{item.variant} × {item.quantity}</span>
                  </div>
                  <span className="track-item-price">₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="track-total">
                <span>Total</span>
                <span>₦{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="track-shipping">
              <h3>Shipping Address</h3>
              <p>{order.customerName}</p>
              <p>{order.address}</p>
              <p>{order.city}, {order.zipCode}</p>
              <p>{order.country}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
