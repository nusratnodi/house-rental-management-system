import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-logo">AB</div>
          <div>
            <strong>AmarBasha</strong>
            <small>Admin Panel</small>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink end to="/admin">
            <span className="admin-nav-ic">📊</span> Dashboard
          </NavLink>
          <NavLink to="/admin/houses">
            <span className="admin-nav-ic">🏠</span> Properties
          </NavLink>
          <NavLink to="/admin/hospitals">
            <span className="admin-nav-ic">🏥</span> Hospitals
          </NavLink>
          <NavLink to="/admin/orders">
            <span className="admin-nav-ic">🧾</span> Bookings
          </NavLink>
          <NavLink to="/admin/users">
            <span className="admin-nav-ic">👥</span> Users
          </NavLink>
        </nav>

        <div className="admin-side-foot">
          <a href="/" className="admin-side-link">↩ Back to site</a>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">Admin Console</div>
          <div className="admin-topbar-right">
            <div className="admin-user">
              <div className="admin-user-avatar">
                {currentUser?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="admin-user-meta">
                <strong>{currentUser?.name}</strong>
                <small>{currentUser?.email}</small>
              </div>
            </div>
            <button className="admin-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
