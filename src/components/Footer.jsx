import './Footer.css'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#" className="footer-logo">
              <img src="/logo.png" alt="Aurelis" style={{ height: '120px', width: 'auto' }} />
            </a>
            <p className="footer-tagline">
              Where minimalist design meets timeless craftsmanship. Luxury in every second.
            </p>
          </div>
          
          <div>
            <h4 className="footer-title">Explore</h4>
            <div className="footer-links">
              <a href="#collection" className="footer-link">The Collection</a>
              <a href="#testimonials" className="footer-link">Testimonials</a>
              <a href="#" className="footer-link">Our Story</a>
              <a href="#" className="footer-link">Craftsmanship</a>
            </div>
          </div>
          
          <div>
            <h4 className="footer-title">Support</h4>
            <div className="footer-links">
              <a href="#contact" className="footer-link">Contact Us</a>
              <a href="#" className="footer-link">Shipping Policy</a>
              <a href="#" className="footer-link">Returns & Exchanges</a>
              <a href="#" className="footer-link">Warranty</a>
            </div>
          </div>
          
          <div>
            <h4 className="footer-title">Newsletter</h4>
            <p className="footer-tagline" style={{ fontSize: '0.85rem' }}>
              Subscribe to receive exclusive access to limited editions and brand news.
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" className="newsletter-input" placeholder="Email address" required />
              <button type="submit" className="newsletter-btn">Join</button>
            </form>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} AURELIS. All rights reserved.</p>
          <button className="back-to-top" onClick={scrollToTop}>
            Back to top
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </footer>
  )
}
