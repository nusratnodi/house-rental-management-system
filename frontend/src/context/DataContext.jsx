import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [houses, setHouses] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [users, setUsers] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [h, hosp, u, pt, o] = await Promise.all([
        api.get("/houses"),
        api.get("/hospitals"),
        api.get("/users"),
        api.get("/property-types"),
        api.get("/orders"),
      ]);
      setHouses(h || []);
      setHospitals(hosp || []);
      setUsers(u || []);
      setPropertyTypes(pt || []);
      setOrders(o || []);
    } catch (err) {
      console.error("[data] failed to load:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // ---------- Houses ----------
  async function createHouse(data) {
    const created = await api.post("/houses", data);
    setHouses((p) => [created, ...p]);
    return created;
  }
  async function updateHouse(id, patch) {
    const updated = await api.put(`/houses/${id}`, patch);
    setHouses((p) => p.map((h) => (h.id === id ? updated : h)));
  }
  async function deleteHouse(id) {
    await api.del(`/houses/${id}`);
    setHouses((p) => p.filter((h) => h.id !== id));
  }

  // ---------- Hospitals ----------
  async function createHospital(data) {
    const created = await api.post("/hospitals", data);
    setHospitals((p) => [...p, created]);
    return created;
  }
  async function updateHospital(id, patch) {
    const updated = await api.put(`/hospitals/${id}`, patch);
    setHospitals((p) => p.map((h) => (h.id === id ? updated : h)));
  }
  async function deleteHospital(id) {
    await api.del(`/hospitals/${id}`);
    setHospitals((p) => p.filter((h) => h.id !== id));
  }

  // ---------- Users ----------
  async function createUser(data) {
    const payload = {
      role: "customer",
      active: true,
      createdAt: new Date().toISOString(),
      ...data,
    };
    const created = await api.post("/users", payload);
    setUsers((p) => [...p, created]);
    return created;
  }
  async function updateUser(id, patch) {
    const updated = await api.put(`/users/${id}`, patch);
    setUsers((p) => p.map((u) => (u.id === id ? updated : u)));
  }
  async function deleteUser(id) {
    await api.del(`/users/${id}`);
    setUsers((p) => p.filter((u) => u.id !== id));
  }

  // ---------- Property Types ----------
  async function createPropertyType(data) {
    if (!data.id) return null;
    if (propertyTypes.some((x) => x.id === data.id)) return null;
    const created = await api.post("/property-types", data);
    setPropertyTypes((p) => [...p, created]);
    return created;
  }
  async function updatePropertyType(id, patch) {
    const updated = await api.put(`/property-types/${id}`, patch);
    setPropertyTypes((p) => p.map((t) => (t.id === id ? updated : t)));
  }
  async function deletePropertyType(id) {
    await api.del(`/property-types/${id}`);
    setPropertyTypes((p) => p.filter((t) => t.id !== id));
  }

  // ---------- Orders ----------
  async function addOrder(order) {
    const created = await api.post("/orders", order);
    setOrders((p) => [created, ...p]);
    return created;
  }
  async function updateOrder(id, patch) {
    const updated = await api.put(`/orders/${id}`, patch);
    setOrders((p) => p.map((o) => (o.id === id ? updated : o)));
  }
  async function deleteOrder(id) {
    await api.del(`/orders/${id}`);
    setOrders((p) => p.filter((o) => o.id !== id));
  }

  const propertyTypeById = useMemo(() => {
    const map = new Map();
    propertyTypes.forEach((t) => map.set(t.id, t));
    return map;
  }, [propertyTypes]);

  function getPropertyType(id) {
    return propertyTypeById.get(id) || null;
  }

  const value = useMemo(
    () => ({
      loading,
      error,
      refresh,
      houses,
      hospitals,
      users,
      orders,
      propertyTypes,
      getPropertyType,
      createHouse,
      updateHouse,
      deleteHouse,
      createHospital,
      updateHospital,
      deleteHospital,
      createUser,
      updateUser,
      deleteUser,
      createPropertyType,
      updatePropertyType,
      deletePropertyType,
      addOrder,
      updateOrder,
      deleteOrder,
    }),
    [loading, error, refresh, houses, hospitals, users, orders, propertyTypes, propertyTypeById]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
