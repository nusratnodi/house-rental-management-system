import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useData } from "../context/DataContext";

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function itemTotal(item) {
  if (item.billingMode === "monthly") {
    return (item.house.pricePerMonth || 0) * (item.months || 0);
  }
  return (item.house.pricePerNight || 0) * (item.nights || 0);
}

export default function Orders() {
  const { orders } = useCart();
  const { getPropertyType } = useData();

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
              {order.items.map((item) => {
                const type = getPropertyType(item.house.propertyType);
                return (
                  <div key={item.house.id} className="order-item">
                    <img src={item.house.image} alt={item.house.title} />
                    <div>
                      <div className="order-item-head">
                        <Link to={`/house/${item.house.id}`} className="cart-item-title">
                          {item.house.title}
                        </Link>
                        {type && (
                          <span className="cart-type-pill">
                            {type.icon} {type.name}
                          </span>
                        )}
                      </div>
                      <p className="cart-item-city">{item.house.city}</p>
                      {item.billingMode === "monthly" ? (
                        <p className="cart-item-meta">
                          Lease · {item.months} {item.months === 1 ? "month" : "months"}
                        </p>
                      ) : (
                        <p className="cart-item-meta">
                          {item.checkIn} → {item.checkOut} · {item.nights}{" "}
                          {item.nights === 1 ? "night" : "nights"}
                        </p>
                      )}
                      <p className="cart-item-meta">
                        Subtotal: <strong>${itemTotal(item).toFixed(2)}</strong>
                        {item.securityDeposit > 0 && (
                          <> · Deposit: <strong>${item.securityDeposit.toFixed(2)}</strong></>
                        )}
                      </p>
                      {item.agreement && (
                        <p className="cart-item-meta cart-item-agreement">
                          {item.agreement.tenantGender && (
                            <>Tenant: <strong>{item.agreement.tenantGender}</strong> · </>
                          )}
                          {item.agreement.idNumber && (
                            <>ID: <strong>{item.agreement.idNumber}</strong> · </>
                          )}
                          Conditions: <strong>{item.agreement.agreed ? "Agreed" : "—"}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="order-footer">
              <div className="order-guest">
                <p><strong>{order.guest.name}</strong></p>
                <p className="muted">
                  {order.guest.email}{order.guest.phone ? ` · ${order.guest.phone}` : ""}
                </p>
              </div>
              <div className="order-totals">
                <div className="price-row">
                  <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span>Service fee</span><span>${order.serviceFee.toFixed(2)}</span>
                </div>
                {order.securityDeposit > 0 && (
                  <div className="price-row">
                    <span>Deposit</span><span>${order.securityDeposit.toFixed(2)}</span>
                  </div>
                )}
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
