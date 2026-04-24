import { useMemo, useState } from "react";
import { useData } from "../../context/DataContext";

const ALL_AMENITIES = ["Wi-Fi", "AC", "Kitchen", "Pool", "Parking", "TV", "Washer"];

function emptyHouse() {
  return {
    title: "",
    city: "",
    address: "",
    lat: 23.8103,
    lng: 90.4125,
    propertyType: "apartment",
    pricePerNight: 50,
    pricePerMonth: 800,
    superFeatured: false,
    rating: 4.5,
    reviews: 0,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    superhost: false,
    amenities: [],
    image: "",
    gallery: [],
    description: "",
  };
}

export default function AdminHouses() {
  const { houses, propertyTypes, createHouse, updateHouse, deleteHouse } = useData();
  const typeOptions = propertyTypes.filter((t) => t.kind !== "tag");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // house or null
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return houses;
    return houses.filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q)
    );
  }, [houses, search]);

  function startCreate() {
    setEditing(emptyHouse());
    setCreating(true);
  }

  function startEdit(h) {
    setEditing({ ...h, gallery: [...(h.gallery || [])], amenities: [...(h.amenities || [])] });
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
      pricePerNight: Number(editing.pricePerNight) || 0,
      pricePerMonth: Number(editing.pricePerMonth) || 0,
      rating: Number(editing.rating) || 0,
      reviews: Number(editing.reviews) || 0,
      bedrooms: Number(editing.bedrooms) || 0,
      bathrooms: Number(editing.bathrooms) || 0,
      guests: Number(editing.guests) || 0,
      lat: Number(editing.lat) || 0,
      lng: Number(editing.lng) || 0,
      superFeatured: !!editing.superFeatured,
      gallery:
        Array.isArray(editing.gallery)
          ? editing.gallery.filter(Boolean)
          : String(editing.gallery || "")
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
    };
    if (!payload.image && payload.gallery[0]) payload.image = payload.gallery[0];
    if (creating) createHouse(payload);
    else updateHouse(payload.id, payload);
    closeForm();
  }

  function onDelete(id) {
    if (confirm("Delete this property? This cannot be undone.")) {
      deleteHouse(id);
    }
  }

  function toggleAmenity(a) {
    setEditing((cur) => {
      const has = cur.amenities.includes(a);
      return {
        ...cur,
        amenities: has ? cur.amenities.filter((x) => x !== a) : [...cur.amenities, a],
      };
    });
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h1>Properties</h1>
          <p className="admin-muted">Create, edit and remove rental listings.</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={startCreate}>
          + Add property
        </button>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-input"
          type="search"
          placeholder="Search by title, city, or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="admin-muted">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Title</th>
              <th>Category</th>
              <th>City</th>
              <th>Night</th>
              <th>Month</th>
              <th>Tags</th>
              <th>Beds</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h) => {
              const type = propertyTypes.find((t) => t.id === h.propertyType);
              return (
                <tr key={h.id}>
                  <td>
                    {h.image ? (
                      <img src={h.image} alt="" className="admin-thumb" />
                    ) : (
                      <div className="admin-thumb admin-thumb-fallback">🏠</div>
                    )}
                  </td>
                  <td>
                    <strong>{h.title}</strong>
                    <div className="admin-muted admin-sm">{h.address}</div>
                  </td>
                  <td>
                    {type ? (
                      <span className="admin-pill admin-pill-customer">
                        {type.icon} {type.name}
                      </span>
                    ) : (
                      <span className="admin-muted admin-sm">—</span>
                    )}
                  </td>
                  <td>{h.city}</td>
                  <td>${h.pricePerNight}</td>
                  <td>${h.pricePerMonth || "—"}</td>
                  <td>
                    {h.superhost && <span className="admin-pill admin-pill-completed">host</span>}{" "}
                    {h.superFeatured && <span className="admin-pill admin-pill-checked-in">✨ super</span>}
                  </td>
                  <td>{h.bedrooms}</td>
                  <td className="admin-row-actions">
                    <button className="admin-btn admin-btn-ghost" onClick={() => startEdit(h)}>
                      Edit
                    </button>
                    <button className="admin-btn admin-btn-danger" onClick={() => onDelete(h.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="admin-empty">
                  No properties match.
                </td>
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
              <h2>{creating ? "New property" : "Edit property"}</h2>
              <button type="button" className="admin-close" onClick={closeForm}>×</button>
            </div>

            <div className="admin-form-grid">
              <label className="admin-col-2">
                Title
                <input
                  required
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </label>
              <label className="admin-col-2">
                Category
                <select
                  required
                  value={editing.propertyType || ""}
                  onChange={(e) => setEditing({ ...editing, propertyType: e.target.value })}
                >
                  <option value="" disabled>Select a category…</option>
                  {typeOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                City
                <input
                  required
                  value={editing.city}
                  onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                />
              </label>
              <label>
                Address
                <input
                  required
                  value={editing.address}
                  onChange={(e) => setEditing({ ...editing, address: e.target.value })}
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
              <label>
                Price / night
                <input
                  type="number"
                  min="0"
                  required
                  value={editing.pricePerNight}
                  onChange={(e) => setEditing({ ...editing, pricePerNight: e.target.value })}
                />
              </label>
              <label>
                Price / month
                <input
                  type="number"
                  min="0"
                  value={editing.pricePerMonth}
                  onChange={(e) => setEditing({ ...editing, pricePerMonth: e.target.value })}
                />
              </label>
              <label>
                Rating
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={editing.rating}
                  onChange={(e) => setEditing({ ...editing, rating: e.target.value })}
                />
              </label>
              <label>
                Reviews
                <input
                  type="number"
                  min="0"
                  value={editing.reviews}
                  onChange={(e) => setEditing({ ...editing, reviews: e.target.value })}
                />
              </label>
              <label>
                Guests
                <input
                  type="number"
                  min="1"
                  value={editing.guests}
                  onChange={(e) => setEditing({ ...editing, guests: e.target.value })}
                />
              </label>
              <label>
                Bedrooms
                <input
                  type="number"
                  min="0"
                  value={editing.bedrooms}
                  onChange={(e) => setEditing({ ...editing, bedrooms: e.target.value })}
                />
              </label>
              <label>
                Bathrooms
                <input
                  type="number"
                  min="0"
                  value={editing.bathrooms}
                  onChange={(e) => setEditing({ ...editing, bathrooms: e.target.value })}
                />
              </label>

              <label className="admin-col-2">
                Main image URL
                <input
                  value={editing.image}
                  onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                />
              </label>
              <label className="admin-col-2">
                Gallery URLs (one per line)
                <textarea
                  rows={3}
                  value={Array.isArray(editing.gallery) ? editing.gallery.join("\n") : editing.gallery}
                  onChange={(e) => setEditing({ ...editing, gallery: e.target.value.split("\n") })}
                />
              </label>
              <label className="admin-col-2">
                Description
                <textarea
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </label>

              <div className="admin-col-2">
                <span className="admin-label">Amenities</span>
                <div className="admin-chips">
                  {ALL_AMENITIES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`admin-chip ${editing.amenities.includes(a) ? "active" : ""}`}
                      onClick={() => toggleAmenity(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <label className="admin-inline">
                <input
                  type="checkbox"
                  checked={!!editing.superhost}
                  onChange={(e) => setEditing({ ...editing, superhost: e.target.checked })}
                />
                Superhost
              </label>
              <label className="admin-inline">
                <input
                  type="checkbox"
                  checked={!!editing.superFeatured}
                  onChange={(e) => setEditing({ ...editing, superFeatured: e.target.checked })}
                />
                ✨ Super Condition (priority listing)
              </label>
            </div>

            <div className="admin-modal-foot">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="admin-btn admin-btn-primary">
                {creating ? "Create property" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
