import { useState, useEffect } from 'react'
import './ReviewSection.css'

export default function ReviewSection({ watchId }) {
  const [reviews, setReviews] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ customerName: '', rating: 5, comment: '' })
  const [submitStatus, setSubmitStatus] = useState('idle') // idle, loading, success, error

  const API_URL = import.meta.env.VITE_API_URL || ''

  useEffect(() => {
    fetchReviews()
  }, [watchId])

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/${watchId}`)
      const data = await res.json()
      if (data.success) setReviews(data.reviews)
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitStatus('loading')

    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchId: watchId.toString(), ...formData })
      })

      if (res.ok) {
        setSubmitStatus('success')
        setFormData({ customerName: '', rating: 5, comment: '' })
        setShowForm(false)
        fetchReviews()
        setTimeout(() => setSubmitStatus('idle'), 3000)
      } else {
        setSubmitStatus('error')
      }
    } catch {
      setSubmitStatus('error')
    }
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const renderStars = (rating, interactive = false, onSelect = null) => {
    return (
      <div className="stars-row">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onSelect && onSelect(star)}
            tabIndex={interactive ? 0 : -1}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={star <= rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="review-section">
      <div className="review-header">
        <h3>Customer Reviews</h3>
        <div className="review-summary">
          {averageRating && (
            <span className="avg-rating">
              {renderStars(Math.round(averageRating))}
              <span className="avg-number">{averageRating}</span>
              <span className="review-count">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </span>
          )}
          {reviews.length === 0 && <span className="no-reviews">No reviews yet. Be the first!</span>}
        </div>
      </div>

      {submitStatus === 'success' && (
        <div className="review-success">Thank you for your review!</div>
      )}

      {!showForm ? (
        <button className="write-review-btn" onClick={() => setShowForm(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Write a Review
        </button>
      ) : (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-form-group">
            <label>Your Name</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="review-form-group">
            <label>Rating</label>
            {renderStars(formData.rating, true, (star) => setFormData(prev => ({ ...prev, rating: star })))}
          </div>
          <div className="review-form-group">
            <label>Your Review</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your experience with this timepiece..."
              required
              rows={3}
            />
          </div>
          <div className="review-form-actions">
            <button type="submit" className="review-submit-btn" disabled={submitStatus === 'loading'}>
              {submitStatus === 'loading' ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" className="review-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-card-header">
                <div className="reviewer-avatar">{review.customerName.charAt(0).toUpperCase()}</div>
                <div className="reviewer-info">
                  <span className="reviewer-name">{review.customerName}</span>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                {renderStars(review.rating)}
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
