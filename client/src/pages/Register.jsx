import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroImg from "../assets/hero.png";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    const res = register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate("/", { replace: true });
  }

  return (
    <div className="auth-page">
      <div className="auth-split">
        <aside className="auth-visual">
          <img src={heroImg} alt="Join AmarBasha" />
          <div className="auth-visual-overlay">
            <h2>Join <span className="logo-text-amar">Amar</span><span className="logo-text-basha">Basha</span></h2>
            <p>Create a free account to book stays across Bangladesh.</p>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="auth-inner">
            <Link to="/" className="auth-back">← Back to home</Link>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-sub">Sign up as a customer — free forever.</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                Full name
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </label>
              <label>
                Phone (optional)
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.confirm}
                  onChange={(e) => update("confirm", e.target.value)}
                />
              </label>

              {error && <p className="hint-error">{error}</p>}

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Creating…" : "Create account"}
              </button>
            </form>

            <p className="auth-alt">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
