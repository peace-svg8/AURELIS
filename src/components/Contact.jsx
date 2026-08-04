import { useState } from 'react'
import ScrollReveal from './ScrollReveal'
import './Contact.css'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  })
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', subject: 'general', message: '' })
      } else {
        setStatus('error')
        setErrorMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    }
  }

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
          <form className="contact-form" onSubmit={handleSubmit}>
            {status === 'success' && (
              <div style={{ padding: '1rem', backgroundColor: '#e6f4ea', color: '#1e8e3e', marginBottom: '1rem', borderRadius: '4px' }}>
                Your inquiry has been sent successfully. We will get back to you soon!
              </div>
            )}
            
            {status === 'error' && (
              <div style={{ padding: '1rem', backgroundColor: '#fce8e6', color: '#d93025', marginBottom: '1rem', borderRadius: '4px' }}>
                {errorMessage}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-input" required placeholder="John Doe" value={formData.name} onChange={handleChange} disabled={status === 'loading'} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" className="form-input" required placeholder="john@example.com" value={formData.email} onChange={handleChange} disabled={status === 'loading'} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select name="subject" className="form-input" required value={formData.subject} onChange={handleChange} disabled={status === 'loading'}>
                <option value="general">General Inquiry</option>
                <option value="support">Order Support</option>
                <option value="wholesale">Wholesale</option>
                <option value="press">Press</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea name="message" className="form-input" required placeholder="How can we help you?" value={formData.message} onChange={handleChange} disabled={status === 'loading'}></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', opacity: status === 'loading' ? 0.7 : 1 }} disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </ScrollReveal>
      </div>
    </section>
  )
}
