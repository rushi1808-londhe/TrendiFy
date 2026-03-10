import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addToCart = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + qty, i.stockQuantity) }
            : i
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  }, []);

  const updateQty = useCallback((productId, qty) => {
    if (qty < 1) return;
    setItems(prev => prev.map(i =>
      i.id === productId ? { ...i, quantity: Math.min(qty, i.stockQuantity) } : i
    ));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems  = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalAmount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
