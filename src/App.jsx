import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Craftsmanship from './components/Craftsmanship'
import Collection from './components/Collection'
import Cart from './components/Cart'
import Checkout from './components/Checkout'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import OrderTracking from './pages/OrderTracking'
import AdminDashboard from './pages/AdminDashboard'
import OrderSuccess from './pages/OrderSuccess'
import NotFound from './pages/NotFound'

import './App.css'

function Storefront() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Craftsmanship />
        <Collection />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <Cart />
      <Checkout />
    </>
  )
}

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route path="/track-order" element={<OrderTracking />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
