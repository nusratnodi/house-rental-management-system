import { createContext, useContext, useEffect, useMemo, useState } from "react";
import seedHouses from "../data/houses.json";
import seedHospitals from "../data/hospitals.json";
import seedUsers from "../data/users.json";

const DataContext = createContext(null);

const HOUSES_KEY = "ohrms_houses";
const HOSPITALS_KEY = "ohrms_hospitals";
const USERS_KEY = "ohrms_users";
const ORDERS_KEY = "ohrms_orders";

function loadOrSeed(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function nextId(list) {
  return list.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
}

export function DataProvider({ children }) {
  const [houses, setHouses] = useState(() => loadOrSeed(HOUSES_KEY, seedHouses));
  const [hospitals, setHospitals] = useState(() => loadOrSeed(HOSPITALS_KEY, seedHospitals));
  const [users, setUsers] = useState(() => loadOrSeed(USERS_KEY, seedUsers));
  const [orders, setOrders] = useState(() => {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => { localStorage.setItem(HOUSES_KEY, JSON.stringify(houses)); }, [houses]);
  useEffect(() => { localStorage.setItem(HOSPITALS_KEY, JSON.stringify(hospitals)); }, [hospitals]);
  useEffect(() => { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); }, [orders]);

  // ---------- Houses ----------
  function createHouse(data) {
    const house = { ...data, id: nextId(houses) };
    setHouses((p) => [house, ...p]);
    return house;
  }
  function updateHouse(id, patch) {
    setHouses((p) => p.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }
  function deleteHouse(id) {
    setHouses((p) => p.filter((h) => h.id !== id));
  }

  // ---------- Hospitals ----------
  function createHospital(data) {
    const hospital = { ...data, id: data.id || `hospital-${Date.now()}` };
    setHospitals((p) => [...p, hospital]);
    return hospital;
  }
  function updateHospital(id, patch) {
    setHospitals((p) => p.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }
  function deleteHospital(id) {
    setHospitals((p) => p.filter((h) => h.id !== id));
  }

  // ---------- Users ----------
  function createUser(data) {
    const user = {
      role: "customer",
      active: true,
      createdAt: new Date().toISOString(),
      ...data,
      id: nextId(users),
    };
    setUsers((p) => [...p, user]);
    return user;
  }
  function updateUser(id, patch) {
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }
  function deleteUser(id) {
    setUsers((p) => p.filter((u) => u.id !== id));
  }

  // ---------- Orders ----------
  function addOrder(order) {
    setOrders((p) => [order, ...p]);
  }
  function updateOrder(id, patch) {
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }
  function deleteOrder(id) {
    setOrders((p) => p.filter((o) => o.id !== id));
  }

  const value = useMemo(
    () => ({
      houses,
      hospitals,
      users,
      orders,
      createHouse,
      updateHouse,
      deleteHouse,
      createHospital,
      updateHospital,
      deleteHospital,
      createUser,
      updateUser,
      deleteUser,
      addOrder,
      updateOrder,
      deleteOrder,
    }),
    [houses, hospitals, users, orders]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
