import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroImg from "../assets/hero.png";

export default function Login() {
  const { loginCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const res = loginCustomer(email, password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="auth-page">
      <div className="auth-split">
        <aside className="auth-visual">
          <img src={heroImg} alt="Find your next home" />
          <div className="auth-visual-overlay">
            <h2>Welcome back to <span className="logo-text-amar">Amar</span><span className="logo-text-basha">Basha</span></h2>
            <p>Sign in to book stays, track your orders, and save favorites.</p>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="auth-inner">
            <Link to="/" className="auth-back">← Back to home</Link>
            <h1 className="auth-title">Customer Login</h1>
            <p className="auth-sub">Sign in with your AmarBasha account.</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                Email
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label>
                Password
                <div className="auth-pw">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowPw((v) => !v)}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              {error && <p className="hint-error">{error}</p>}

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="auth-alt">
              New to AmarBasha? <Link to="/register">Create an account</Link>
            </p>

            <div className="auth-divider"><span>or</span></div>
            <Link to="/admin/login" className="btn btn-secondary">
              Sign in as Admin
            </Link>

            <div className="auth-hint">
              <strong>Demo customer:</strong> john@example.com / user123
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
