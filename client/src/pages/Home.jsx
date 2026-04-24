import { useMemo, useState } from "react";
import HouseCard from "../components/HouseCard";
import { useData } from "../context/DataContext";

const ALL_AMENITIES = ["Wi-Fi", "AC", "Kitchen", "Pool", "Parking", "TV"];

export default function Home() {
  const { houses: housesData, propertyTypes } = useData();
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(250);
  const [superhostOnly, setSuperhostOnly] = useState(false);
  const [superFeaturedOnly, setSuperFeaturedOnly] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [typeId, setTypeId] = useState("");

  function toggleAmenity(a) {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  const visibleTypes = useMemo(
    () => propertyTypes.filter((t) => t.kind !== "tag"),
    [propertyTypes]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = housesData.filter((h) => {
      if (q && !`${h.title} ${h.city} ${h.address}`.toLowerCase().includes(q)) return false;
      if (h.pricePerNight > maxPrice) return false;
      if (superhostOnly && !h.superhost) return false;
      if (superFeaturedOnly && !h.superFeatured) return false;
      if (typeId && h.propertyType !== typeId) return false;
      if (selectedAmenities.length > 0) {
        const hasAll = selectedAmenities.every((a) => h.amenities.includes(a));
        if (!hasAll) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if ((b.superFeatured ? 1 : 0) - (a.superFeatured ? 1 : 0) !== 0) {
        return (b.superFeatured ? 1 : 0) - (a.superFeatured ? 1 : 0);
      }
      return b.id - a.id;
    });
    return list;
  }, [search, maxPrice, superhostOnly, superFeaturedOnly, typeId, selectedAmenities, housesData]);

  return (
    <div className="container">
      <section className="hero">
        <h1>Find your next stay</h1>
        <p>Discover unique homes — from city apartments to beachfront bungalows.</p>
      </section>

      <section className="category-strip">
        <div className="category-chips">
          <button
            type="button"
            className={`category-chip ${!typeId ? "active" : ""}`}
            onClick={() => setTypeId("")}
          >
            <span className="category-chip-ic">🌐</span>
            <span className="category-chip-label">All</span>
          </button>
          {visibleTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`category-chip ${typeId === t.id ? "active" : ""}`}
              onClick={() => setTypeId(typeId === t.id ? "" : t.id)}
              title={t.description}
            >
              <span className="category-chip-ic">{t.icon}</span>
              <span className="category-chip-label">{t.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="filters">
        <input
          type="text"
          placeholder="Search by city, area, or property name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <div className="filter-row">
          <label className="filter-item">
            Max nightly price: <strong>${maxPrice}</strong>
            <input
              type="range"
              min="20"
              max="250"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </label>

          <label className="filter-item checkbox">
            <input
              type="checkbox"
              checked={superhostOnly}
              onChange={(e) => setSuperhostOnly(e.target.checked)}
            />
            Superhost only
          </label>

          <label className="filter-item checkbox">
            <input
              type="checkbox"
              checked={superFeaturedOnly}
              onChange={(e) => setSuperFeaturedOnly(e.target.checked)}
            />
            ✨ Super Condition only
          </label>
        </div>

        <div className="amenity-chips">
          {ALL_AMENITIES.map((a) => (
            <button
              key={a}
              type="button"
              className={`chip ${selectedAmenities.includes(a) ? "chip-active" : ""}`}
              onClick={() => toggleAmenity(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      <p className="results-count">
        {filtered.length} stay{filtered.length === 1 ? "" : "s"} found
      </p>

      <div className="grid">
        {filtered.map((house) => (
          <HouseCard key={house.id} house={house} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>No homes match your filters. Try widening your search.</p>
        </div>
      )}
    </div>
  );
}
