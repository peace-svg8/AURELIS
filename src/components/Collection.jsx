import { useState, useEffect } from 'react'
import { watches as staticWatches } from '../data/watches'
import WatchCard from './WatchCard'
import ProductModal from './ProductModal'
import ScrollReveal from './ScrollReveal'
import './Collection.css'

export default function Collection() {
  const [selectedWatch, setSelectedWatch] = useState(null)
  const [watches, setWatches] = useState(staticWatches)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWatches = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/watches`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.watches) {
            // Merge backend inventory with rich frontend data (specs, gallery)
            const mergedWatches = data.watches.map(dbWatch => {
              const staticWatch = staticWatches.find(sw => sw.id.toString() === dbWatch.id.toString()) || {};
              return {
                ...dbWatch,
                gallery: staticWatch.gallery || [dbWatch.image],
                specs: staticWatch.specs || {}
              };
            });
            setWatches(mergedWatches);
          }
        }
      } catch (err) {
        console.error("Failed to load inventory from server, using fallback.", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWatches();
  }, []);

  if (loading) {
    return (
      <section id="collection" className="container" style={{ padding: 'var(--section-padding)' }}>
         <div style={{ textAlign: 'center', color: 'var(--gold)' }}>Loading Collection...</div>
      </section>
    )
  }

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
