import { useMemo, useState } from "react";
import HouseCard from "../components/HouseCard";
import { haversineKm } from "../utils/distance";
import { useData } from "../context/DataContext";

const ALL_AMENITIES = ["Wi-Fi", "AC", "Kitchen", "Pool", "Parking", "TV"];
const NEAR_RADIUS_KM = 8;

export default function Home() {
  const { houses: housesData, hospitals: hospitalsData } = useData();
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(250);
  const [superhostOnly, setSuperhostOnly] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [hospitalId, setHospitalId] = useState("");

  function toggleAmenity(a) {
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  const selectedHospital = useMemo(
    () => hospitalsData.find((h) => h.id === hospitalId) || null,
    [hospitalId, hospitalsData]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = housesData
      .map((h) => {
        const distance = selectedHospital
          ? haversineKm(selectedHospital.lat, selectedHospital.lng, h.lat, h.lng)
          : null;
        return { ...h, distance };
      })
      .filter((h) => {
        if (q && !`${h.title} ${h.city} ${h.address}`.toLowerCase().includes(q)) return false;
        if (h.pricePerNight > maxPrice) return false;
        if (superhostOnly && !h.superhost) return false;
        if (selectedAmenities.length > 0) {
          const hasAll = selectedAmenities.every((a) => h.amenities.includes(a));
          if (!hasAll) return false;
        }
        if (selectedHospital && h.distance > NEAR_RADIUS_KM) return false;
        return true;
      });

    if (selectedHospital) {
      list.sort((a, b) => a.distance - b.distance);
    }
    return list;
  }, [search, maxPrice, superhostOnly, selectedAmenities, selectedHospital, housesData]);

  return (
    <div className="container">
      <section className="hero">
        <h1>Find your next stay</h1>
        <p>Discover unique homes — from city apartments to beachfront bungalows.</p>
      </section>

      <section className="hospital-strip">
        <div className="hospital-strip-head">
          <h2>🏥 Stays near popular Dhaka hospitals</h2>
          {selectedHospital && (
            <button className="link-clear" onClick={() => setHospitalId("")}>
              Clear hospital
            </button>
          )}
        </div>
        <div className="hospital-chips">
          {hospitalsData.map((hosp) => (
            <button
              key={hosp.id}
              type="button"
              className={`hospital-chip ${hospitalId === hosp.id ? "active" : ""}`}
              onClick={() => setHospitalId(hospitalId === hosp.id ? "" : hosp.id)}
            >
              <span className="hospital-chip-icon">{hosp.icon}</span>
              <span>
                <strong>{hosp.name}</strong>
                <small>{hosp.area}</small>
              </span>
            </button>
          ))}
        </div>
        {selectedHospital && (
          <p className="hospital-note">
            Showing stays within {NEAR_RADIUS_KM} km of <strong>{selectedHospital.name}</strong>, sorted by distance.
          </p>
        )}
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
            Max price: <strong>${maxPrice}</strong>
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
        {selectedHospital && ` near ${selectedHospital.name}`}
      </p>

      <div className="grid">
        {filtered.map((house) => (
          <HouseCard
            key={house.id}
            house={house}
            distanceKm={house.distance}
            hospitalName={selectedHospital?.name}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>
            {selectedHospital
              ? `No stays within ${NEAR_RADIUS_KM} km of ${selectedHospital.name}. Try clearing the hospital filter or widening other filters.`
              : "No homes match your filters. Try widening your search."}
          </p>
        </div>
      )}
    </div>
  );
}
