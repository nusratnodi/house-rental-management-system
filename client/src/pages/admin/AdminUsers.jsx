import { useMemo, useState } from "react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

function emptyUser() {
  return { name: "", email: "", phone: "", password: "", role: "customer", active: true };
}

export default function AdminUsers() {
  const { users, createUser, updateUser, deleteUser } = useData();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  function startCreate() {
    setEditing(emptyUser());
    setCreating(true);
  }

  function startEdit(u) {
    setEditing({ ...u, password: "" });
    setCreating(false);
  }

  function closeForm() {
    setEditing(null);
    setCreating(false);
  }

  function onSave(e) {
    e.preventDefault();
    if (creating) {
      if (users.some((u) => u.email.toLowerCase() === editing.email.toLowerCase())) {
        alert("An account with this email already exists.");
        return;
      }
      createUser({
        name: editing.name.trim(),
        email: editing.email.trim(),
        phone: editing.phone?.trim() || "",
        password: editing.password,
        role: editing.role,
        active: editing.active,
      });
    } else {
      const patch = {
        name: editing.name.trim(),
        email: editing.email.trim(),
        phone: editing.phone?.trim() || "",
        role: editing.role,
        active: editing.active,
      };
      if (editing.password) patch.password = editing.password;
      updateUser(editing.id, patch);
    }
    closeForm();
  }

  function toggleActive(u) {
    updateUser(u.id, { active: !u.active });
  }

  function onDelete(u) {
    if (u.id === currentUser?.id) {
      alert("You cannot delete the account you are signed in with.");
      return;
    }
    if (confirm(`Delete ${u.name}? This cannot be undone.`)) {
      deleteUser(u.id);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Users</h1>
          <p className="admin-muted">Manage customers and admins.</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={startCreate}>
          + Add user
        </button>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-input"
          type="search"
          placeholder="Search by name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All roles</option>
          <option value="customer">Customers</option>
          <option value="admin">Admins</option>
        </select>
        <span className="admin-muted">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="admin-user-cell">
                    <div className="admin-user-avatar admin-user-avatar-sm">
                      {u.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <strong>{u.name}</strong>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>{u.phone || "—"}</td>
                <td>
                  <span className={`admin-pill admin-pill-${u.role}`}>{u.role}</span>
                </td>
                <td>
                  <span className={`admin-pill ${u.active ? "admin-pill-confirmed" : "admin-pill-cancelled"}`}>
                    {u.active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="admin-muted admin-sm">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="admin-row-actions">
                  <button className="admin-btn admin-btn-ghost" onClick={() => startEdit(u)}>
                    Edit
                  </button>
                  <button className="admin-btn admin-btn-ghost" onClick={() => toggleActive(u)}>
                    {u.active ? "Disable" : "Enable"}
                  </button>
                  <button className="admin-btn admin-btn-danger" onClick={() => onDelete(u)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-empty">No users match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="admin-modal" onClick={closeForm}>
          <form className="admin-modal-card" onClick={(e) => e.stopPropagation()} onSubmit={onSave}>
            <div className="admin-modal-head">
              <h2>{creating ? "New user" : "Edit user"}</h2>
              <button type="button" className="admin-close" onClick={closeForm}>×</button>
            </div>

            <div className="admin-form-grid">
              <label className="admin-col-2">
                Full name
                <input
                  required
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  required
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                />
              </label>
              <label>
                Phone
                <input
                  value={editing.phone || ""}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                />
              </label>
              <label>
                Role
                <select
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label>
                {creating ? "Password" : "New password (optional)"}
                <input
                  type="password"
                  required={creating}
                  minLength={creating ? 6 : 0}
                  value={editing.password}
                  onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                />
              </label>
              <label className="admin-col-2 admin-inline">
                <input
                  type="checkbox"
                  checked={!!editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                />
                Active (can sign in)
              </label>
            </div>

            <div className="admin-modal-foot">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="admin-btn admin-btn-primary">
                {creating ? "Create user" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
