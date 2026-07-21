import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Craftsmanship from './components/Craftsmanship'
import Collection from './components/Collection'
import Cart from './components/Cart'
import Checkout from './components/Checkout'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import './App.css'

function App() {
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
      <ChatWidget />
    </>
  )
}

export default App
