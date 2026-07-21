import ScrollReveal from './ScrollReveal'
import './Contact.css'

export default function Contact() {
  return (
    <section id="contact" className="container" style={{ padding: 'var(--section-padding)' }}>
      <ScrollReveal>
        <h2 className="section-title">Get in <span>Touch</span></h2>
        <p className="section-subtitle">
          Our concierges are available to assist you with any inquiries regarding our timepieces or your order.
        </p>
      </ScrollReveal>

      <div className="contact-grid">
        <ScrollReveal delay={200}>
          <div className="contact-info">
            <div className="info-block">
              <h3>Client Services</h3>
              <p>concierge@aurelis.com</p>
              <p>+41 44 213 44 44</p>
              <p>Monday - Friday, 9am - 6pm (CET)</p>
            </div>
            
            <div className="info-block">
              <h3>Headquarters</h3>
              <p>AURELIS Horlogerie SA</p>
              <p>Rue du Rhône 65</p>
              <p>1204 Geneva, Switzerland</p>
            </div>

            <div className="info-block">
              <h3>Connect</h3>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Instagram">IG</a>
                <a href="#" className="social-link" aria-label="Twitter">TW</a>
                <a href="#" className="social-link" aria-label="Facebook">FB</a>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" required placeholder="John Doe" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" required placeholder="john@example.com" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-input" required>
                <option value="general">General Inquiry</option>
                <option value="support">Order Support</option>
                <option value="wholesale">Wholesale</option>
                <option value="press">Press</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-input" required placeholder="How can we help you?"></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Send Message
            </button>
          </form>
        </ScrollReveal>
      </div>
    </section>
  )
}
