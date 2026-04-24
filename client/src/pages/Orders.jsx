import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

export default function Orders() {
  const { orders } = useCart();

  if (orders.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>No orders yet</h2>
          <p>Once you book a stay, your orders will show up here.</p>
          <Link to="/" className="btn btn-primary">Browse stays</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>My Orders</h1>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <strong>Order #{order.id}</strong>
                <p className="order-date">{formatDate(order.placedAt)}</p>
              </div>
              <span className="status-pill">{order.status}</span>
            </div>

            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.house.id} className="order-item">
                  <img src={item.house.image} alt={item.house.title} />
                  <div>
                    <Link to={`/house/${item.house.id}`} className="cart-item-title">
                      {item.house.title}
                    </Link>
                    <p className="cart-item-city">{item.house.city}</p>
                    <p className="cart-item-meta">
                      {item.checkIn} → {item.checkOut} · {item.nights} night{item.nights === 1 ? "" : "s"}
                    </p>
                    <p className="cart-item-meta">
                      ${item.house.pricePerNight} × {item.nights} = <strong>${(item.house.pricePerNight * item.nights).toFixed(2)}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="order-guest">
                <p><strong>{order.guest.name}</strong></p>
                <p className="muted">{order.guest.email}{order.guest.phone ? ` · ${order.guest.phone}` : ""}</p>
              </div>
              <div className="order-totals">
                <div className="price-row">
                  <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span>Service fee</span><span>${order.serviceFee.toFixed(2)}</span>
                </div>
                <div className="price-row total">
                  <span>Total paid</span><span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
