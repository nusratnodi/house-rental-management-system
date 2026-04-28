import { Link } from "react-router-dom";
import { useData } from "../../context/DataContext";

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

export default function Dashboard() {
  const { houses, hospitals, users, orders } = useData();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const confirmed = orders.filter((o) => o.status === "Confirmed").length;
  const cancelled = orders.filter((o) => o.status === "Cancelled").length;
  const customers = users.filter((u) => u.role === "customer").length;
  const admins = users.filter((u) => u.role === "admin").length;
  const superhosts = houses.filter((h) => h.superhost).length;
  const avgPrice = houses.length
    ? Math.round(houses.reduce((s, h) => s + h.pricePerNight, 0) / houses.length)
    : 0;

  const recent = orders.slice(0, 5);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="admin-muted">Overview of the AmarBasha rental platform.</p>
        </div>
      </div>

      <section className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat-ic">🏠</span>
          <div>
            <strong>{houses.length}</strong>
            <small>Properties listed</small>
          </div>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-ic">🧾</span>
          <div>
            <strong>{orders.length}</strong>
            <small>Total bookings</small>
          </div>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-ic">💰</span>
          <div>
            <strong>${totalRevenue.toFixed(2)}</strong>
            <small>Revenue</small>
          </div>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-ic">👥</span>
          <div>
            <strong>{customers}</strong>
            <small>Customers</small>
          </div>
        </div>
      </section>

      <section className="admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-head">
            <h2>Recent bookings</h2>
            <Link to="/admin/orders" className="admin-link">View all →</Link>
          </div>
          {recent.length === 0 ? (
            <p className="admin-muted">No bookings yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Guest</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Placed</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.guest?.name || "—"}</td>
                    <td>${o.total.toFixed(2)}</td>
                    <td>
                      <span className={`admin-pill admin-pill-${(o.status || "").toLowerCase()}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>{formatDate(o.placedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card-head">
            <h2>Platform health</h2>
          </div>
          <ul className="admin-kv">
            <li><span>Hospitals</span><strong>{hospitals.length}</strong></li>
            <li><span>Admin users</span><strong>{admins}</strong></li>
            <li><span>Superhost listings</span><strong>{superhosts}</strong></li>
            <li><span>Avg. price / night</span><strong>${avgPrice}</strong></li>
            <li><span>Confirmed bookings</span><strong>{confirmed}</strong></li>
            <li><span>Cancelled bookings</span><strong>{cancelled}</strong></li>
          </ul>
        </div>
      </section>
    </div>
  );
}
