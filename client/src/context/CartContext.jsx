import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const CART_KEY = "ohrms_cart";
const ORDERS_KEY = "ohrms_orders";

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  function addToCart(house, checkIn, checkOut, nights) {
    setCart((prev) => {
      const exists = prev.find((item) => item.house.id === house.id);
      if (exists) {
        return prev.map((item) =>
          item.house.id === house.id
            ? { ...item, checkIn, checkOut, nights }
            : item
        );
      }
      return [...prev, { house, checkIn, checkOut, nights }];
    });
  }

  function removeFromCart(houseId) {
    setCart((prev) => prev.filter((item) => item.house.id !== houseId));
  }

  function updateCartItem(houseId, updates) {
    setCart((prev) =>
      prev.map((item) =>
        item.house.id === houseId ? { ...item, ...updates } : item
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  function placeOrder(guestInfo) {
    if (cart.length === 0) return null;
    const subtotal = cart.reduce(
      (sum, item) => sum + item.house.pricePerNight * item.nights,
      0
    );
    const serviceFee = +(subtotal * 0.12).toFixed(2);
    const total = +(subtotal + serviceFee).toFixed(2);
    const order = {
      id: Date.now(),
      placedAt: new Date().toISOString(),
      items: cart,
      subtotal,
      serviceFee,
      total,
      guest: guestInfo,
      status: "Confirmed",
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    return order;
  }

  const cartCount = cart.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        orders,
        cartCount,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
