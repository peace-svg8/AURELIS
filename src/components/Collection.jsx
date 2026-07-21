import { useState } from 'react'
import { watches } from '../data/watches'
import WatchCard from './WatchCard'
import ProductModal from './ProductModal'
import ScrollReveal from './ScrollReveal'
import './Collection.css'

export default function Collection() {
  const [selectedWatch, setSelectedWatch] = useState(null)

  return (
    <section id="collection" className="container" style={{ padding: 'var(--section-padding)' }}>
      <ScrollReveal>
        <h2 className="section-title">The <span>Collection</span></h2>
        <p className="section-subtitle">
          Explore our meticulously crafted timepieces, designed for those who appreciate the perfect balance of form and function.
        </p>
      </ScrollReveal>

      <div className="collection-grid">
        {watches.map((watch, index) => (
          <ScrollReveal key={watch.id} delay={index * 100}>
            <WatchCard watch={watch} onClick={() => setSelectedWatch(watch)} />
          </ScrollReveal>
        ))}
      </div>

      {selectedWatch && (
        <ProductModal watch={selectedWatch} onClose={() => setSelectedWatch(null)} />
      )}
    </section>
  )
}
