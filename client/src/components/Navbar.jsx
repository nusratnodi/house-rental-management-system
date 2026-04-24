import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { cartCount } = useCart();

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
          <NavLink to="/orders">My Orders</NavLink>
          <NavLink to="/cart" className="cart-link">
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
