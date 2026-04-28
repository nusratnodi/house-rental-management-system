import { useState } from "react";
import { useData } from "../../context/DataContext";

function emptyHospital() {
  return { id: "", name: "", area: "", lat: 23.8103, lng: 90.4125, icon: "🏥" };
}

function slug(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminHospitals() {
  const { hospitals, createHospital, updateHospital, deleteHospital } = useData();
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  function startCreate() {
    setEditing(emptyHospital());
    setCreating(true);
  }

  function startEdit(h) {
    setEditing({ ...h });
    setCreating(false);
  }

  function closeForm() {
    setEditing(null);
    setCreating(false);
  }

  function onSave(e) {
    e.preventDefault();
    const payload = {
      ...editing,
      lat: Number(editing.lat) || 0,
      lng: Number(editing.lng) || 0,
    };
    if (creating) {
      if (!payload.id) payload.id = slug(payload.name);
      if (hospitals.some((x) => x.id === payload.id)) {
        alert("A hospital with this ID already exists.");
        return;
      }
      createHospital(payload);
    } else {
      updateHospital(payload.id, payload);
    }
    closeForm();
  }

  function onDelete(id) {
    if (confirm("Delete this hospital?")) deleteHospital(id);
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Hospitals</h1>
          <p className="admin-muted">Landmarks used to surface nearby stays to patients.</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={startCreate}>
          + Add hospital
        </button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Name</th>
              <th>Area</th>
              <th>Coordinates</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map((h) => (
              <tr key={h.id}>
                <td className="admin-ic-cell">{h.icon || "🏥"}</td>
                <td>
                  <strong>{h.name}</strong>
                  <div className="admin-muted admin-sm">{h.id}</div>
                </td>
                <td>{h.area}</td>
                <td className="admin-muted admin-sm">
                  {h.lat.toFixed(4)}, {h.lng.toFixed(4)}
                </td>
                <td className="admin-row-actions">
                  <button className="admin-btn admin-btn-ghost" onClick={() => startEdit(h)}>
                    Edit
                  </button>
                  <button className="admin-btn admin-btn-danger" onClick={() => onDelete(h.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {hospitals.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty">No hospitals.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="admin-modal" onClick={closeForm}>
          <form
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
            onSubmit={onSave}
          >
            <div className="admin-modal-head">
              <h2>{creating ? "New hospital" : "Edit hospital"}</h2>
              <button type="button" className="admin-close" onClick={closeForm}>×</button>
            </div>

            <div className="admin-form-grid">
              <label className="admin-col-2">
                Name
                <input
                  required
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </label>
              <label>
                ID {creating && <small className="admin-muted">(auto from name)</small>}
                <input
                  value={editing.id}
                  disabled={!creating}
                  onChange={(e) => setEditing({ ...editing, id: e.target.value })}
                />
              </label>
              <label>
                Icon
                <input
                  value={editing.icon}
                  onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                />
              </label>
              <label className="admin-col-2">
                Area
                <input
                  required
                  value={editing.area}
                  onChange={(e) => setEditing({ ...editing, area: e.target.value })}
                />
              </label>
              <label>
                Latitude
                <input
                  type="number"
                  step="0.0001"
                  value={editing.lat}
                  onChange={(e) => setEditing({ ...editing, lat: e.target.value })}
                />
              </label>
              <label>
                Longitude
                <input
                  type="number"
                  step="0.0001"
                  value={editing.lng}
                  onChange={(e) => setEditing({ ...editing, lng: e.target.value })}
                />
              </label>
            </div>

            <div className="admin-modal-foot">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="admin-btn admin-btn-primary">
                {creating ? "Create hospital" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
