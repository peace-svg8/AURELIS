import { Routes, Route } from 'react-router-dom'
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
    <Routes>
      <Route path="/" element={<Storefront />} />
      <Route path="/track-order" element={<OrderTracking />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  )
}

export default App
