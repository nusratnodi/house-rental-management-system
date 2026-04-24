import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import HouseDetails from "./pages/HouseDetails";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminHouses from "./pages/admin/AdminHouses";
import AdminHospitals from "./pages/admin/AdminHospitals";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import { RequireAdmin, RequireCustomer } from "./components/ProtectedRoute";

export default function App() {
  const { pathname } = useLocation();
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    );
  }

  if (isAdminPage) {
    return (
      <Routes>
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="houses" element={<AdminHouses />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="hospitals" element={<AdminHospitals />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/house/:id" element={<HouseDetails />} />
          <Route
            path="/cart"
            element={
              <RequireCustomer>
                <Cart />
              </RequireCustomer>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireCustomer>
                <Orders />
              </RequireCustomer>
            }
          />
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
