import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function OrderSuccess() {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--black)', color: 'var(--white)', padding: '20px', textAlign: 'center' }}>
      <div style={{ marginBottom: '30px' }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', marginBottom: '16px' }}>Payment Successful</h1>
      <p style={{ color: 'var(--white-muted)', maxWidth: '500px', lineHeight: '1.6', marginBottom: '30px' }}>
        Thank you for your purchase. Your payment has been successfully processed and your luxury timepiece is being prepared for expedited shipping.
      </p>
      <Link to="/" style={{ display: 'inline-block', backgroundColor: 'var(--gold)', color: 'var(--black)', padding: '12px 24px', textDecoration: 'none', fontFamily: 'var(--font-heading)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Return to Boutique
      </Link>
    </div>
  )
}
