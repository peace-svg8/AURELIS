import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import './Navbar.css'
import './MobileMenu.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { totalItems, setIsCartOpen } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [isMobileMenuOpen])

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <a href="#" className="nav-logo">
          <img src="/logo.png" alt="Aurelis" style={{ height: '96px', width: 'auto' }} />
        </a>
        
        <div className="nav-links">
          <a href="#hero" className="nav-link">Home</a>
          <a href="#collection" className="nav-link">Collection</a>
          <a href="#testimonials" className="nav-link">Testimonials</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>

        <div className="nav-actions">
          <button className="cart-btn" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
          
          <button className="menu-btn" aria-label="Menu" onClick={() => setIsMobileMenuOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />
      
      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span className="nav-logo">
            <img src="/logo.png" alt="Aurelis" style={{ height: '80px', width: 'auto' }} />
          </span>
          <button className="close-menu-btn" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="mobile-menu-links">
          <a href="#hero" className="mobile-nav-link" style={{ animationDelay: '0.1s' }} onClick={handleMobileLinkClick}>Home</a>
          <a href="#collection" className="mobile-nav-link" style={{ animationDelay: '0.2s' }} onClick={handleMobileLinkClick}>Collection</a>
          <a href="#testimonials" className="mobile-nav-link" style={{ animationDelay: '0.3s' }} onClick={handleMobileLinkClick}>Testimonials</a>
          <a href="#contact" className="mobile-nav-link" style={{ animationDelay: '0.4s' }} onClick={handleMobileLinkClick}>Contact</a>
        </div>
        <div className="mobile-menu-footer">
          <button 
            className="btn btn-primary mobile-cart-btn" 
            onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }}
          >
            Cart {totalItems > 0 && `(${totalItems})`}
          </button>
          <p className="mobile-tagline">Curators of Excellence</p>
        </div>
      </div>
    </nav>
  )
}
