import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const addToCart = useCallback((watch, variant, quantity = 1) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.id === watch.id && item.variant === variant
      )
      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        }
        return updated
      }
      return [...prev, { ...watch, variant, quantity }]
    })
  }, [])

  const removeFromCart = useCallback((id, variant) => {
    setItems(prev => prev.filter(item => !(item.id === id && item.variant === variant)))
  }, [])

  const updateQuantity = useCallback((id, variant, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id, variant)
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.id === id && item.variant === variant ? { ...item, quantity } : item
      )
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
