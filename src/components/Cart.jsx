import { useCart } from '../context/CartContext'
import './Cart.css'

export default function Cart() {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    subtotal,
    setIsCheckoutOpen
  } = useCart()

  const handleCheckoutClick = () => {
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  return (
    <>
      <div 
        className={`cart-panel-overlay ${isCartOpen ? 'open' : ''}`} 
        onClick={() => setIsCartOpen(false)}
      />
      <div className={`cart-panel ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3 className="section-title" style={{ fontSize: '1.5rem', marginBottom: 0 }}>Your <span>Cart</span></h3>
          <button className="cart-close" onClick={() => setIsCartOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <p className="empty-cart">Your collection is empty.</p>
          ) : (
            items.map(item => (
              <div key={`${item.id}-${item.variant}`} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <h4 className="cart-item-title">{item.name}</h4>
                  <p className="cart-item-variant">{item.variant}</p>
                  
                  <div className="cart-item-bottom">
                    <div className="quantity-selector" style={{ transform: 'scale(0.85)', transformOrigin: 'left center' }}>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}>-</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}>+</button>
                    </div>
                    <span className="cart-item-price">${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
                
                <button 
                  className="cart-item-remove" 
                  onClick={() => removeFromCart(item.id, item.variant)}
                  aria-label="Remove item"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary-row">
              <span>Complimentary Shipping</span>
              <span>$0.00</span>
            </div>
            <div className="cart-total">
              <span>Total</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <button className="btn btn-primary checkout-btn" onClick={handleCheckoutClick}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
