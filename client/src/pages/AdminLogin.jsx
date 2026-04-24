import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = loginAdmin(email, password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="admin-auth">
      <div className="admin-auth-card">
        <div className="admin-auth-brand">
          <div className="admin-auth-logo">AB</div>
          <div>
            <h1>AmarBasha · Admin</h1>
            <p>Restricted access · staff only</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-auth-form">
          <label>
            Admin email
            <input
              type="email"
              required
              autoComplete="username"
              placeholder="admin@amarbasha.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="admin-auth-error">{error}</p>}

          <button type="submit" className="admin-auth-btn" disabled={submitting}>
            {submitting ? "Authenticating…" : "Access admin panel"}
          </button>
        </form>

        <div className="admin-auth-footer">
          <Link to="/login">← Customer login</Link>
          <span>·</span>
          <Link to="/">Home</Link>
        </div>

        <div className="admin-auth-hint">
          <strong>Demo admin:</strong> admin@amarbasha.com / admin123
        </div>
      </div>
    </div>
  );
}
