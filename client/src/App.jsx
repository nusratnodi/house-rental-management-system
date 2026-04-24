import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import HouseDetails from "./pages/HouseDetails";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/house/:id" element={<HouseDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} AmarBasha · University Project (OHRMS)</p>
        </div>
      </footer>
    </div>
  );
}
