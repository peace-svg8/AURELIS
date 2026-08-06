import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-subtitle">Page Not Found</p>
        <p className="not-found-desc">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary not-found-btn">
          Return to Boutique
        </Link>
      </div>
    </div>
  )
}
