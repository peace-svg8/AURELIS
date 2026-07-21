import './WatchCard.css'

export default function WatchCard({ watch, onClick }) {
  return (
    <div 
      className="glass-card watch-card" 
      onClick={onClick}
    >
      <div className="card-image-container">
        <img src={watch.image} alt={watch.name} className="card-image" loading="lazy" />
      </div>
      <div className="card-content">
        <h3 className="card-title">{watch.name}</h3>
        <p className="card-tagline">{watch.tagline}</p>
        <p className="card-price">${watch.price.toLocaleString()}</p>
        <button className="btn btn-outline card-btn">View Details</button>
      </div>
    </div>
  )
}
