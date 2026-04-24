import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { cartCount } = useCart();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo">
          <img src="/logo.jpeg" alt="AmarBasha" className="logo-img" />
          <span className="logo-text">
            <span className="logo-text-amar">Amar</span>
            <span className="logo-text-basha">Basha</span>
          </span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>Browse</NavLink>
          {isAuthenticated && <NavLink to="/orders">My Orders</NavLink>}
          <NavLink to="/cart" className="cart-link">
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-btn nav-btn-ghost">Log in</Link>
              <Link to="/register" className="nav-btn nav-btn-primary">Sign up</Link>
            </>
          ) : (
            <div className="nav-menu" ref={menuRef}>
              <button className="nav-avatar" onClick={() => setOpen((v) => !v)}>
                <span className="nav-avatar-circle">
                  {currentUser.name?.[0]?.toUpperCase() || "U"}
                </span>
                <span className="nav-avatar-name">{currentUser.name?.split(" ")[0]}</span>
                <span className="nav-avatar-caret">▾</span>
              </button>
              {open && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-head">
                    <strong>{currentUser.name}</strong>
                    <small>{currentUser.email}</small>
                    <span className={`admin-pill admin-pill-${currentUser.role}`}>
                      {currentUser.role}
                    </span>
                  </div>
                  {currentUser.role === "admin" && (
                    <Link to="/admin" className="nav-dropdown-item" onClick={() => setOpen(false)}>
                      Admin panel
                    </Link>
                  )}
                  <Link to="/orders" className="nav-dropdown-item" onClick={() => setOpen(false)}>
                    My orders
                  </Link>
                  <button className="nav-dropdown-item nav-dropdown-danger" onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
