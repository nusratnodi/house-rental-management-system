import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { useData } from "./DataContext";

const CartContext = createContext(null);
const CART_KEY = "ohrms_cart";

export function CartProvider({ children }) {
  const { currentUser } = useAuth();
  const { orders, addOrder } = useData();

  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  function addToCart(house, checkIn, checkOut, nights, extras = {}) {
    const base = {
      house,
      checkIn,
      checkOut,
      nights,
      billingMode: extras.billingMode || "daily",
      months: extras.months || 0,
      unitPrice: extras.unitPrice ?? (house.pricePerNight || 0),
      subtotal:
        extras.subtotal ??
        ((extras.billingMode === "monthly"
          ? (house.pricePerMonth || 0) * (extras.months || 0)
          : (house.pricePerNight || 0) * nights)),
      securityDeposit: extras.securityDeposit || 0,
      agreement: {
        agreed: false,
        tenantGender: "",
        idNumber: "",
      },
    };
    setCart((prev) => {
      const exists = prev.find((item) => item.house.id === house.id);
      if (exists) {
        return prev.map((item) =>
          item.house.id === house.id
            ? {
                ...item,
                ...base,
                agreement: item.agreement || base.agreement,
              }
            : item
        );
      }
      return [...prev, base];
    });
  }

  function removeFromCart(houseId) {
    setCart((prev) => prev.filter((item) => item.house.id !== houseId));
  }

  function updateCartItem(houseId, updates) {
    setCart((prev) =>
      prev.map((item) => (item.house.id === houseId ? { ...item, ...updates } : item))
    );
  }

  function clearCart() {
    setCart([]);
  }

  function placeOrder(guestInfo) {
    if (cart.length === 0) return null;
    const subtotal = cart.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const depositTotal = cart.reduce((sum, item) => sum + (item.securityDeposit || 0), 0);
    const serviceFee = +(subtotal * 0.12).toFixed(2);
    const total = +(subtotal + serviceFee + depositTotal).toFixed(2);
    const order = {
      id: Date.now(),
      placedAt: new Date().toISOString(),
      userId: currentUser?.id ?? null,
      items: cart,
      subtotal,
      serviceFee,
      securityDeposit: depositTotal,
      total,
      guest: guestInfo,
      status: "Confirmed",
    };
    addOrder(order);
    setCart([]);
    return order;
  }

  const myOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter((o) => o.userId === currentUser.id);
  }, [orders, currentUser]);

  const cartCount = cart.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        orders: myOrders,
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
