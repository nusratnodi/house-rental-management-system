import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useData } from "./DataContext";

const AuthContext = createContext(null);
const SESSION_KEY = "ohrms_session";

function publicUser(u) {
  if (!u) return null;
  const rest = { ...u };
  delete rest.password;
  return rest;
}

export function AuthProvider({ children }) {
  const { users, createUser, updateUser } = useData();

  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null; // { userId, role }
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }, [session]);

  const currentUser = useMemo(() => {
    if (!session) return null;
    return publicUser(users.find((u) => u.id === session.userId));
  }, [session, users]);

  function loginAs(role, email, password) {
    const u = users.find(
      (x) =>
        x.email.toLowerCase() === email.toLowerCase().trim() &&
        x.password === password &&
        x.role === role &&
        x.active !== false
    );
    if (!u) return { ok: false, error: "Invalid credentials for this account type." };
    setSession({ userId: u.id, role: u.role });
    return { ok: true, user: publicUser(u) };
  }

  function loginCustomer(email, password) {
    return loginAs("customer", email, password);
  }

  function loginAdmin(email, password) {
    return loginAs("admin", email, password);
  }

  function logout() {
    setSession(null);
  }

  function register({ name, email, password, phone }) {
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (exists) return { ok: false, error: "An account with this email already exists." };
    const user = createUser({
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone?.trim() || "",
      role: "customer",
      active: true,
    });
    setSession({ userId: user.id, role: user.role });
    return { ok: true, user: publicUser(user) };
  }

  function updateProfile(patch) {
    if (!currentUser) return;
    updateUser(currentUser.id, patch);
  }

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === "admin",
    isCustomer: currentUser?.role === "customer",
    loginCustomer,
    loginAdmin,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
