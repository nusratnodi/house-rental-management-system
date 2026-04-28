import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useData } from "./DataContext";
import { api } from "../utils/api";

const AuthContext = createContext(null);
const SESSION_KEY = "ohrms_session";

function publicUser(u) {
  if (!u) return null;
  const rest = { ...u };
  delete rest.password;
  return rest;
}

export function AuthProvider({ children }) {
  const { users, refresh, updateUser } = useData();

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

  async function loginAs(role, email, password) {
    try {
      const res = await api.post("/auth/login", { role, email, password });
      if (!res?.ok || !res.user) return { ok: false, error: "Invalid credentials for this account type." };
      setSession({ userId: res.user.id, role: res.user.role });
      return { ok: true, user: res.user };
    } catch (err) {
      return { ok: false, error: err.message || "Login failed." };
    }
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

  async function register({ name, email, password, phone }) {
    try {
      const res = await api.post("/auth/register", { name, email, password, phone });
      if (!res?.ok || !res.user) return { ok: false, error: "Registration failed." };
      await refresh();
      setSession({ userId: res.user.id, role: res.user.role });
      return { ok: true, user: res.user };
    } catch (err) {
      return { ok: false, error: err.message || "Registration failed." };
    }
  }

  async function updateProfile(patch) {
    if (!currentUser) return;
    await updateUser(currentUser.id, patch);
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
