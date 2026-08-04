import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import ReviewSection from './ReviewSection'
import './ProductModal.css'

export default function ProductModal({ watch, onClose }) {
  const [selectedVariant, setSelectedVariant] = useState(watch.variants[0])
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const [isZooming, setIsZooming] = useState(false)
  const { addToCart, setIsCartOpen } = useCart()

  // Use gallery if available, fallback to single image
  const gallery = watch.gallery || [watch.image]
  const currentImage = gallery[activeImageIndex]

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden' // Prevent bg scrolling
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [onClose])

  const handleAddToCart = () => {
    addToCart(watch, selectedVariant, quantity)
    onClose()
    setIsCartOpen(true)
  }

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setZoomPosition({ x, y })
  }

  // Simple helper to assign a hex color based on variant string
  const getSwatchColor = (variantName) => {
    const name = variantName.toLowerCase()
    if (name.includes('gold')) return '#d4af37'
    if (name.includes('rose')) return '#b76e79'
    if (name.includes('black')) return '#1a1a1a'
    if (name.includes('navy')) return '#1a2a3a'
    if (name.includes('burgundy')) return '#4a1020'
    if (name.includes('brown') || name.includes('tan')) return '#8b5a2b'
    if (name.includes('steel') || name.includes('silver')) return '#e0e0e0'
    if (name.includes('titanium')) return '#878681'
    return '#ffffff' // Default white
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close modal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="modal-gallery-col">
          {/* Main Image with Zoom */}
          <div 
            className="main-image-container"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            <img 
              src={currentImage} 
              alt={`${watch.name} detail`} 
              className={`modal-image ${isZooming ? 'zooming' : ''}`}
              style={isZooming ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
            />
          </div>
          
          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="thumbnail-row">
              {gallery.map((img, idx) => (
                <button 
                  key={idx} 
                  className={`thumbnail-btn ${activeImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="modal-details">
          <h2 className="modal-title section-title">{watch.name}</h2>
          <p className="modal-tagline">{watch.tagline}</p>
          <p className="modal-price">${watch.price.toLocaleString()}</p>
          
          {/* Romance Copy */}
          {watch.description && (
            <p className="modal-description">{watch.description}</p>
          )}

          <div className="specs-list">
            {Object.entries(watch.specs).map(([key, value]) => (
              <div className="spec-item" key={key}>
                <span className="spec-label">{key}</span>
                <span className="spec-value">{value}</span>
              </div>
            ))}
          </div>

          <div className="variant-selector">
            <span className="variant-label">Select Style</span>
            <div className="variant-options">
              {watch.variants.map(variant => (
                <button
                  key={variant}
                  className={`variant-btn ${selectedVariant === variant ? 'active' : ''}`}
                  onClick={() => setSelectedVariant(variant)}
                >
                  <span 
                    className="variant-swatch" 
                    style={{ backgroundColor: getSwatchColor(variant) }} 
                  />
                  {variant}
                </button>
              ))}
            </div>
          </div>

          <div className="quantity-add">
            <div className="quantity-selector">
              <button 
                className="qty-btn" 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >-</button>
              <span className="qty-value">{quantity}</span>
              <button 
                className="qty-btn" 
                onClick={() => setQuantity(quantity + 1)}
              >+</button>
            </div>
            <button className="btn btn-primary add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>

          <ReviewSection watchId={watch.id} />
        </div>
      </div>
    </div>
  )
}
