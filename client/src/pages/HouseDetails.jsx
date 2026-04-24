import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useData } from "../context/DataContext";

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default function HouseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { houses: housesData } = useData();

  const house = housesData.find((h) => h.id === Number(id));
  const [activeImage, setActiveImage] = useState(house?.gallery?.[0] || house?.image);
  const [checkIn, setCheckIn] = useState(todayPlus(1));
  const [checkOut, setCheckOut] = useState(todayPlus(4));
  const [added, setAdded] = useState(false);

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);
  const subtotal = (house?.pricePerNight || 0) * nights;
  const serviceFee = +(subtotal * 0.12).toFixed(2);
  const total = +(subtotal + serviceFee).toFixed(2);

  if (!house) {
    return (
      <div className="container">
        <p>House not found. <Link to="/">Go back</Link></p>
      </div>
    );
  }

  function handleAdd() {
    if (nights <= 0) return;
    addToCart(house, checkIn, checkOut, nights);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBookNow() {
    if (nights <= 0) return;
    addToCart(house, checkIn, checkOut, nights);
    navigate("/cart");
  }

  return (
    <div className="container">
      <Link to="/" className="back-link">← Back to listings</Link>

      <h1 className="details-title">{house.title}</h1>
      <div className="details-subhead">
        <span>★ {house.rating} ({house.reviews} reviews)</span>
        <span>·</span>
        <span>{house.address}</span>
        {house.superhost && (
          <>
            <span>·</span>
            <span className="badge-superhost-inline">Superhost</span>
          </>
        )}
      </div>

      <div className="gallery">
        <img src={activeImage} alt={house.title} className="gallery-main" />
        <div className="gallery-thumbs">
          {(house.gallery || [house.image]).map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className={`gallery-thumb ${activeImage === src ? "active" : ""}`}
              onClick={() => setActiveImage(src)}
            />
          ))}
        </div>
      </div>

      <div className="details-grid">
        <div className="details-info">
          <p className="details-meta">
            {house.guests} guests · {house.bedrooms} bedrooms · {house.bathrooms} bathrooms
          </p>
          <h2>About this place</h2>
          <p>{house.description}</p>

          <h2>Amenities</h2>
          <ul className="amenity-list">
            {house.amenities.map((a) => (
              <li key={a}>✓ {a}</li>
            ))}
          </ul>
        </div>

        <aside className="booking-box">
          <p className="booking-price">
            <strong>${house.pricePerNight}</strong> <span>/ night</span>
          </p>

          <label>
            Check-in
            <input
              type="date"
              value={checkIn}
              min={todayPlus(0)}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </label>
          <label>
            Check-out
            <input
              type="date"
              value={checkOut}
              min={checkIn || todayPlus(1)}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </label>

          <div className="price-rows">
            <div className="price-row">
              <span>${house.pricePerNight} × {nights} night{nights === 1 ? "" : "s"}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Service fee (12%)</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <div className="price-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleBookNow} disabled={nights <= 0}>
            Book now
          </button>
          <button className="btn btn-secondary" onClick={handleAdd} disabled={nights <= 0}>
            {added ? "✓ Added to cart" : "Add to cart"}
          </button>
          {nights <= 0 && <p className="hint-error">Pick a check-out date after check-in.</p>}
        </aside>
      </div>
    </div>
  );
}
