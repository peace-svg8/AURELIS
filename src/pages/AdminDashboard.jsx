import { useState, useEffect } from 'react'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const [token, setToken] = useState(sessionStorage.getItem('admin_token') || '')
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem('admin_token'))
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL || ''

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await res.json()
      if (res.ok) {
        setToken(data.token)
        sessionStorage.setItem('admin_token', data.token)
        setIsLoggedIn(true)
      } else {
        setLoginError(data.error || 'Login failed.')
      }
    } catch {
      setLoginError('Network error.')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token')
    setToken('')
    setIsLoggedIn(false)
    setOrders([])
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.status === 401) {
        handleLogout()
        return
      }
      const data = await res.json()
      if (data.success) setOrders(data.orders)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isLoggedIn && token) fetchOrders()
  }, [isLoggedIn])

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    }
    setUpdatingId(null)
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const pendingCount = orders.filter(o => o.status === 'PENDING_PAYMENT').length
  const shippedCount = orders.filter(o => o.status === 'SHIPPED' || o.status === 'DELIVERED').length

  const statuses = ['PENDING_PAYMENT', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

  // Login Gate
  if (!isLoggedIn) {
    return (
      <div className="admin-page">
        <div className="admin-login-card">
          <a href="/" className="admin-back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Store
          </a>
          <div className="admin-login-header">
            <span className="admin-logo">AURELIS</span>
            <h1>Admin Panel</h1>
            <p>Enter your password to continue.</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-password-input"
              autoFocus
            />
            {loginError && <p className="admin-login-error">{loginError}</p>}
            <button type="submit" className="admin-login-btn">Sign In</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <span className="admin-logo">AURELIS</span>
            <h1>Admin Dashboard</h1>
          </div>
          <div className="admin-header-actions">
            <a href="/" className="admin-store-link">View Store</a>
            <button onClick={handleLogout} className="admin-logout-btn">Logout</button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line></svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{orders.length}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon revenue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">${totalRevenue.toLocaleString()}</span>
              <span className="stat-label">Total Revenue</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{pendingCount}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon shipped">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{shippedCount}</span>
              <span className="stat-label">Shipped / Delivered</span>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="admin-table-wrapper">
          <div className="admin-table-header">
            <h2>Orders</h2>
            <button onClick={fetchOrders} className="admin-refresh-btn" disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {orders.length === 0 && !loading ? (
            <div className="admin-empty">No orders found.</div>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="order-id">#{order.id}</td>
                      <td>{order.customerName}</td>
                      <td className="order-email">{order.email}</td>
                      <td>
                        <div className="order-items-cell">
                          {order.items.map(item => (
                            <span key={item.id} className="order-item-tag">{item.name} ×{item.quantity}</span>
                          ))}
                        </div>
                      </td>
                      <td className="order-total">${order.totalAmount.toLocaleString()}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`status-select ${order.status.toLowerCase().replace('_', '-')}`}
                          disabled={updatingId === order.id}
                        >
                          {statuses.map(s => (
                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="order-date">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
