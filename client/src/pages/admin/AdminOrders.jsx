import { Fragment, useMemo, useState } from "react";
import { useData } from "../../context/DataContext";

const STATUSES = ["Confirmed", "Checked-in", "Completed", "Cancelled"];

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

export default function AdminOrders() {
  const { orders, users, updateOrder, deleteOrder } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const userById = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      const u = userById.get(o.userId);
      return (
        String(o.id).includes(q) ||
        (o.guest?.name || "").toLowerCase().includes(q) ||
        (o.guest?.email || "").toLowerCase().includes(q) ||
        (u?.email || "").toLowerCase().includes(q)
      );
    });
  }, [orders, search, statusFilter, userById]);

  function onStatusChange(o, status) {
    updateOrder(o.id, { status });
  }

  function onDelete(id) {
    if (confirm("Delete this booking? This cannot be undone.")) {
      deleteOrder(id);
      if (expanded === id) setExpanded(null);
    }
  }

  const revenue = filtered.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Bookings</h1>
          <p className="admin-muted">Every reservation placed on the platform.</p>
        </div>
        <div className="admin-muted">
          Revenue (filtered): <strong>${revenue.toFixed(2)}</strong>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-input"
          type="search"
          placeholder="Search by ID, guest name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="admin-muted">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Guest</th>
              <th>Account</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Placed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const acct = userById.get(o.userId);
              const isOpen = expanded === o.id;
              return (
                <Fragment key={o.id}>
                  <tr>
                    <td><strong>#{o.id}</strong></td>
                    <td>
                      {o.guest?.name || "—"}
                      <div className="admin-muted admin-sm">{o.guest?.email}</div>
                    </td>
                    <td>{acct ? acct.email : <span className="admin-muted">guest</span>}</td>
                    <td>{o.items?.length || 0}</td>
                    <td>${o.total?.toFixed(2)}</td>
                    <td>
                      <select
                        className="admin-select admin-select-sm"
                        value={o.status}
                        onChange={(e) => onStatusChange(o, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="admin-muted admin-sm">{formatDate(o.placedAt)}</td>
                    <td className="admin-row-actions">
                      <button
                        className="admin-btn admin-btn-ghost"
                        onClick={() => setExpanded(isOpen ? null : o.id)}
                      >
                        {isOpen ? "Hide" : "Details"}
                      </button>
                      <button className="admin-btn admin-btn-danger" onClick={() => onDelete(o.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="admin-expand-row">
                      <td colSpan={8}>
                        <div className="admin-expand">
                          <div>
                            <h4>Items</h4>
                            <ul className="admin-kv">
                              {o.items.map((it) => (
                                <li key={it.house.id}>
                                  <span>
                                    {it.house.title}
                                    <small className="admin-muted"> · {it.checkIn} → {it.checkOut}</small>
                                  </span>
                                  <strong>${(it.house.pricePerNight * it.nights).toFixed(2)}</strong>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4>Guest contact</h4>
                            <p>{o.guest?.name}</p>
                            <p className="admin-muted">{o.guest?.email}</p>
                            <p className="admin-muted">{o.guest?.phone || "—"}</p>
                          </div>
                          <div>
                            <h4>Totals</h4>
                            <ul className="admin-kv">
                              <li><span>Subtotal</span><strong>${o.subtotal?.toFixed(2)}</strong></li>
                              <li><span>Service fee</span><strong>${o.serviceFee?.toFixed(2)}</strong></li>
                              <li><span>Total</span><strong>${o.total?.toFixed(2)}</strong></li>
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="admin-empty">No bookings match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
