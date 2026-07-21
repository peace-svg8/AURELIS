import { useState, useEffect } from 'react'
import { testimonials } from '../data/testimonials'
import ScrollReveal from './ScrollReveal'
import './Testimonials.css'

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const handlePrev = () => {
    setActiveIndex((current) => (current === 0 ? testimonials.length - 1 : current - 1))
  }

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length)
  }

  return (
    <section id="testimonials" className="testimonials-section" style={{ padding: 'var(--section-padding)' }}>
      <div className="container">
        <ScrollReveal>
          <h2 className="section-title">What Our <span>Clients Say</span></h2>
          <p className="section-subtitle">
            Discover the experiences of those who wear AURELIS.
          </p>
        </ScrollReveal>

        <div className="testimonials-carousel">
          {testimonials.map((t, index) => (
            <div key={t.id} className={`testimonial-card ${index === activeIndex ? 'active' : ''}`}>
              <div className="testimonial-rating">
                {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
              </div>
              <p className="testimonial-quote">"{t.quote}"</p>
              
              <div className="testimonial-author">
                <div className="author-avatar">{t.avatar}</div>
                <div className="author-info">
                  <div className="author-name">{t.name}</div>
                  <div className="author-location">{t.location}</div>
                </div>
              </div>
            </div>
          ))}

          <div className="carousel-controls">
            <button className="control-btn" onClick={handlePrev} aria-label="Previous testimonial">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            
            <div className="carousel-dots">
              {testimonials.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`dot ${idx === activeIndex ? 'active' : ''}`}
                  onClick={() => setActiveIndex(idx)}
                />
              ))}
            </div>

            <button className="control-btn" onClick={handleNext} aria-label="Next testimonial">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
