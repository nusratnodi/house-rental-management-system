import { useState } from "react";
import { useData } from "../../context/DataContext";

const PRICING_MODES = [
  { value: "monthly", label: "Monthly only" },
  { value: "daily", label: "Daily only" },
  { value: "both", label: "Daily or monthly" },
  { value: "none", label: "No pricing (tag)" },
];

const GENDER_RULES = [
  { value: "any", label: "Anyone" },
  { value: "male", label: "Male only" },
  { value: "female", label: "Female only" },
];

function emptyType() {
  return {
    id: "",
    name: "",
    icon: "🏠",
    kind: "type",
    pricingMode: "monthly",
    minLeaseMonths: 6,
    securityDepositMonths: 1,
    tenantGenderRule: "any",
    familyPreferred: false,
    requiresIdVerification: true,
    description: "",
    conditions: [],
  };
}

function slug(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminCategories() {
  const { propertyTypes, createPropertyType, updatePropertyType, deletePropertyType } = useData();
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  function startCreate() {
    setEditing(emptyType());
    setCreating(true);
  }

  function startEdit(t) {
    setEditing({ ...t, conditions: [...(t.conditions || [])] });
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
      minLeaseMonths: Number(editing.minLeaseMonths) || 0,
      securityDepositMonths: Number(editing.securityDepositMonths) || 0,
      conditions: (editing.conditions || []).map((c) => c.trim()).filter(Boolean),
    };
    if (creating) {
      if (!payload.id) payload.id = slug(payload.name);
      const created = createPropertyType(payload);
      if (!created) {
        alert("A category with this ID already exists.");
        return;
      }
    } else {
      updatePropertyType(payload.id, payload);
    }
    closeForm();
  }

  function onDelete(t) {
    if (confirm(`Delete "${t.name}"? Listings using this category will need to be reassigned.`)) {
      deletePropertyType(t.id);
    }
  }

  function updateCondition(index, value) {
    setEditing((cur) => {
      const list = [...cur.conditions];
      list[index] = value;
      return { ...cur, conditions: list };
    });
  }

  function removeCondition(index) {
    setEditing((cur) => ({
      ...cur,
      conditions: cur.conditions.filter((_, i) => i !== index),
    }));
  }

  function addCondition() {
    setEditing((cur) => ({ ...cur, conditions: [...cur.conditions, ""] }));
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Categories & Conditions</h1>
          <p className="admin-muted">
            Property types shown on the homepage and at checkout. Edit conditions any time — they
            update everywhere instantly.
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={startCreate}>
          + Add category
        </button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Pricing</th>
              <th>Min lease</th>
              <th>Deposit</th>
              <th>Tenant rule</th>
              <th>Kind</th>
              <th>Conditions</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {propertyTypes.map((t) => (
              <tr key={t.id}>
                <td>
                  <div className="admin-user-cell">
                    <span className="admin-ic-cell">{t.icon}</span>
                    <div>
                      <strong>{t.name}</strong>
                      <div className="admin-muted admin-sm">{t.id}</div>
                    </div>
                  </div>
                </td>
                <td>{t.pricingMode}</td>
                <td>{t.minLeaseMonths || 0} mo</td>
                <td>{t.securityDepositMonths || 0} mo</td>
                <td>{t.tenantGenderRule}</td>
                <td>
                  <span className={`admin-pill ${t.kind === "tag" ? "admin-pill-completed" : "admin-pill-customer"}`}>
                    {t.kind === "tag" ? "tag" : "type"}
                  </span>
                </td>
                <td className="admin-muted admin-sm">{t.conditions?.length || 0} rule(s)</td>
                <td className="admin-row-actions">
                  <button className="admin-btn admin-btn-ghost" onClick={() => startEdit(t)}>
                    Edit
                  </button>
                  <button className="admin-btn admin-btn-danger" onClick={() => onDelete(t)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {propertyTypes.length === 0 && (
              <tr>
                <td colSpan={8} className="admin-empty">No categories defined.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="admin-modal" onClick={closeForm}>
          <form className="admin-modal-card" onClick={(e) => e.stopPropagation()} onSubmit={onSave}>
            <div className="admin-modal-head">
              <h2>{creating ? "New category" : `Edit · ${editing.name}`}</h2>
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
                Icon (emoji)
                <input
                  value={editing.icon}
                  onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                />
              </label>
              <label>
                Kind
                <select
                  value={editing.kind || "type"}
                  onChange={(e) => setEditing({ ...editing, kind: e.target.value })}
                >
                  <option value="type">Primary type</option>
                  <option value="tag">Tag / feature</option>
                </select>
              </label>
              <label>
                Pricing mode
                <select
                  value={editing.pricingMode}
                  onChange={(e) => setEditing({ ...editing, pricingMode: e.target.value })}
                >
                  {PRICING_MODES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Min lease (months)
                <input
                  type="number"
                  min="0"
                  value={editing.minLeaseMonths}
                  onChange={(e) => setEditing({ ...editing, minLeaseMonths: e.target.value })}
                />
              </label>
              <label>
                Security deposit (months)
                <input
                  type="number"
                  min="0"
                  value={editing.securityDepositMonths}
                  onChange={(e) => setEditing({ ...editing, securityDepositMonths: e.target.value })}
                />
              </label>
              <label>
                Tenant gender rule
                <select
                  value={editing.tenantGenderRule}
                  onChange={(e) => setEditing({ ...editing, tenantGenderRule: e.target.value })}
                >
                  {GENDER_RULES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </label>
              <label className="admin-inline">
                <input
                  type="checkbox"
                  checked={!!editing.familyPreferred}
                  onChange={(e) => setEditing({ ...editing, familyPreferred: e.target.checked })}
                />
                Family preferred
              </label>
              <label className="admin-inline">
                <input
                  type="checkbox"
                  checked={!!editing.requiresIdVerification}
                  onChange={(e) => setEditing({ ...editing, requiresIdVerification: e.target.checked })}
                />
                Require ID verification
              </label>

              <label className="admin-col-2">
                Short description
                <textarea
                  rows={2}
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </label>

              <div className="admin-col-2">
                <div className="admin-label-row">
                  <span className="admin-label">Conditions shown at checkout</span>
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={addCondition}>
                    + Add rule
                  </button>
                </div>
                <ul className="admin-conditions-edit">
                  {editing.conditions.map((c, i) => (
                    <li key={i}>
                      <input
                        value={c}
                        onChange={(e) => updateCondition(i, e.target.value)}
                        placeholder={`Rule ${i + 1}`}
                      />
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={() => removeCondition(i)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                  {editing.conditions.length === 0 && (
                    <li className="admin-muted admin-sm">No rules yet. Add the first one.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="admin-modal-foot">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="admin-btn admin-btn-primary">
                {creating ? "Create category" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
