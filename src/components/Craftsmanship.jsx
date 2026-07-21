import { useEffect } from 'react'
import ScrollReveal from './ScrollReveal'
import './Craftsmanship.css'

export default function Craftsmanship() {
  return (
    <section id="craftsmanship" className="craftsmanship-section">
      
      {/* Authority Banner */}
      <div className="authority-banner">
        <div className="container">
          <p className="authority-title">Recognized By Excellence</p>
          <div className="authority-logos">
            <span className="brand-logo gq">GQ</span>
            <span className="brand-logo forbes">Forbes</span>
            <span className="brand-logo esquire">Esquire</span>
            <span className="brand-logo watchtime">WatchTime</span>
          </div>
        </div>
      </div>

      <div className="container">
        
        {/* Row 1: The Movement */}
        <div className="craftsmanship-row">
          <ScrollReveal className="craftsmanship-image-wrapper">
            <img 
              src="/craftsmanship_gears.png" 
              alt="Ultra macro shot of mechanical watch gears and tourbillon" 
              className="craftsmanship-image" 
            />
          </ScrollReveal>
          
          <ScrollReveal className="craftsmanship-text" delay={200}>
            <h2 className="craftsmanship-title">
              The Heart of <span>Precision</span>
            </h2>
            <p className="craftsmanship-description">
              We curate only the finest timepieces. Every watch in the Aurelis collection represents a masterpiece of micro-engineering, sourced from brands whose automatic movements are assembled by master horologists.
            </p>
            <ul className="craftsmanship-list">
              <li>Self-winding mechanical caliber</li>
              <li>72-hour power reserve</li>
              <li>Exquisite Côtes de Genève finishing</li>
            </ul>
          </ScrollReveal>
        </div>

        {/* Row 2: The Crystal */}
        <div className="craftsmanship-row reverse">
          <ScrollReveal className="craftsmanship-text">
            <h2 className="craftsmanship-title">
              Uncompromising <span>Clarity</span>
            </h2>
            <p className="craftsmanship-description">
              True luxury is both beautiful and indestructible. The dial is protected 
              by a double-domed sapphire crystal, second only to diamond in hardness. 
              Treated with seven layers of anti-reflective coating, it provides an 
              unobstructed window into the soul of your watch.
            </p>
            <ul className="craftsmanship-list">
              <li>Scratch-resistant sapphire</li>
              <li>Double-domed curvature</li>
              <li>7-layer AR coating</li>
            </ul>
          </ScrollReveal>

          <ScrollReveal className="craftsmanship-image-wrapper" delay={200}>
            <img 
              src="/craftsmanship_crystal.png" 
              alt="Macro shot of water droplets on a sapphire crystal watch dial" 
              className="craftsmanship-image" 
            />
          </ScrollReveal>
        </div>

      </div>
    </section>
  )
}
