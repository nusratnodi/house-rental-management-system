import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default function Cart() {
  const { cart, removeFromCart, updateCartItem, placeOrder } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [guest, setGuest] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
  });

  const subtotal = cart.reduce(
    (sum, item) => sum + item.house.pricePerNight * item.nights,
    0
  );
  const serviceFee = +(subtotal * 0.12).toFixed(2);
  const total = +(subtotal + serviceFee).toFixed(2);

  function handleDateChange(item, field, value) {
    const next = { ...item, [field]: value };
    next.nights = nightsBetween(next.checkIn, next.checkOut);
    updateCartItem(item.house.id, { checkIn: next.checkIn, checkOut: next.checkOut, nights: next.nights });
  }

  function handlePlaceOrder(e) {
    e.preventDefault();
    if (!guest.name || !guest.email) return;
    const order = placeOrder(guest);
    if (order) navigate("/orders");
  }

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p>Browse stays and add some to your cart.</p>
          <Link to="/" className="btn btn-primary">Browse stays</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Your Cart</h1>

      <div className="cart-grid">
        <div className="cart-items">
          {cart.map((item) => {
            const itemTotal = item.house.pricePerNight * item.nights;
            return (
              <div key={item.house.id} className="cart-item">
                <img src={item.house.image} alt={item.house.title} className="cart-item-img" />
                <div className="cart-item-body">
                  <Link to={`/house/${item.house.id}`} className="cart-item-title">
                    {item.house.title}
                  </Link>
                  <p className="cart-item-city">{item.house.city}</p>

                  <div className="cart-dates">
                    <label>
                      Check-in
                      <input
                        type="date"
                        value={item.checkIn}
                        onChange={(e) => handleDateChange(item, "checkIn", e.target.value)}
                      />
                    </label>
                    <label>
                      Check-out
                      <input
                        type="date"
                        value={item.checkOut}
                        min={item.checkIn}
                        onChange={(e) => handleDateChange(item, "checkOut", e.target.value)}
                      />
                    </label>
                  </div>

                  <p className="cart-item-meta">
                    ${item.house.pricePerNight} × {item.nights} night{item.nights === 1 ? "" : "s"} = <strong>${itemTotal.toFixed(2)}</strong>
                  </p>

                  <button
                    className="btn-link-danger"
                    onClick={() => removeFromCart(item.house.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="cart-summary">
          <h2>Summary</h2>
          <div className="price-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span>Service fee (12%)</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <div className="price-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          {!showCheckout ? (
            <button
              className="btn btn-primary"
              onClick={() => setShowCheckout(true)}
              disabled={subtotal <= 0}
            >
              Proceed to checkout
            </button>
          ) : (
            <form onSubmit={handlePlaceOrder} className="checkout-form">
              <h3>Guest details</h3>
              <label>
                Full name
                <input
                  required
                  type="text"
                  value={guest.name}
                  onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={guest.email}
                  onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                />
              </label>
              <label>
                Phone
                <input
                  type="tel"
                  value={guest.phone}
                  onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                />
              </label>
              <button type="submit" className="btn btn-primary">
                Confirm & place order
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
