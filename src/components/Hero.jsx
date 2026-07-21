import { useEffect, useState } from 'react'
import './Hero.css'

export default function Hero() {
  const [scrollY, setScrollY] = useState(0)
  const [stats, setStats] = useState({
    sold: 0,
    countries: 0,
    warranty: 0
  })

  useEffect(() => {
    // Simple counter animation
    const duration = 2000
    const steps = 60
    const stepTime = Math.abs(Math.floor(duration / steps))
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easeOut = 1 - Math.pow(1 - progress, 3)

      setStats({
        sold: Math.floor(easeOut * 10000),
        countries: Math.floor(easeOut * 45),
        warranty: Math.floor(easeOut * 5)
      })

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, stepTime)

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      clearInterval(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Calculate parallax offset (moves slower than scroll)
  const parallaxOffset = scrollY * 0.35

  return (
    <section id="hero" className="hero">
      <div 
        className="container hero-content" 
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      >
        <h1 className="hero-title">
          Curators of <br /><span>Excellence</span>
        </h1>
        <p className="hero-subtitle">
          Discover a hand-selected collection of the world's most extraordinary timepieces.
        </p>
        <div className="hero-cta">
          <a href="#collection" className="btn btn-primary">Explore Collection</a>
          <a href="#collection" className="btn btn-outline">Shop Now</a>
        </div>
        
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{stats.sold.toLocaleString()}+</span>
            <span className="stat-label">Timepieces Sold</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.countries}+</span>
            <span className="stat-label">Countries</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.warranty}-Year</span>
            <span className="stat-label">Warranty</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">Swiss</span>
            <span className="stat-label">Movement</span>
          </div>
        </div>
      </div>
    </section>
  )
}
