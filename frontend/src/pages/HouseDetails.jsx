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
  const { houses: housesData, getPropertyType, propertyTypes } = useData();

  const house = housesData.find((h) => h.id === Number(id));
  const type = house ? getPropertyType(house.propertyType) : null;
  const superTag = propertyTypes.find((t) => t.id === "super" && t.kind === "tag");

  const defaultMode =
    type?.pricingMode === "monthly"
      ? "monthly"
      : type?.pricingMode === "daily"
      ? "daily"
      : "monthly";

  const [billingMode, setBillingMode] = useState(defaultMode);
  const [activeImage, setActiveImage] = useState(house?.gallery?.[0] || house?.image);
  const [checkIn, setCheckIn] = useState(todayPlus(1));
  const [checkOut, setCheckOut] = useState(todayPlus(4));
  const [months, setMonths] = useState(Math.max(1, type?.minLeaseMonths || 1));
  const [added, setAdded] = useState(false);

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);

  const monthly = billingMode === "monthly";
  const unitCount = monthly ? months : nights;
  const unitLabel = monthly ? (months === 1 ? "month" : "months") : (nights === 1 ? "night" : "nights");
  const unitPrice = monthly ? house?.pricePerMonth || 0 : house?.pricePerNight || 0;
  const subtotal = unitPrice * unitCount;
  const serviceFee = +(subtotal * 0.12).toFixed(2);
  const securityDeposit = monthly && type?.securityDepositMonths
    ? (house?.pricePerMonth || 0) * type.securityDepositMonths
    : 0;
  const total = +(subtotal + serviceFee + securityDeposit).toFixed(2);

  if (!house) {
    return (
      <div className="container">
        <p>House not found. <Link to="/">Go back</Link></p>
      </div>
    );
  }

  const canSwitchMode = type?.pricingMode === "both";
  const canBookDaily = type?.pricingMode !== "monthly";
  const canBookMonthly = type?.pricingMode !== "daily" && (house.pricePerMonth > 0);

  function buildItem() {
    return {
      checkIn: monthly ? todayPlus(1) : checkIn,
      checkOut: monthly ? "" : checkOut,
      nights: monthly ? 0 : nights,
      billingMode,
      months: monthly ? months : 0,
      unitPrice,
      subtotal,
      securityDeposit,
    };
  }

  function handleAdd() {
    if (monthly) {
      if (months < (type?.minLeaseMonths || 1)) return;
    } else {
      if (nights <= 0) return;
    }
    const extras = buildItem();
    addToCart(house, extras.checkIn, extras.checkOut, extras.nights, extras);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBookNow() {
    if (monthly) {
      if (months < (type?.minLeaseMonths || 1)) return;
    } else {
      if (nights <= 0) return;
    }
    const extras = buildItem();
    addToCart(house, extras.checkIn, extras.checkOut, extras.nights, extras);
    navigate("/cart");
  }

  return (
    <div className="container">
      <Link to="/" className="back-link">← Back to listings</Link>

      <h1 className="details-title">{house.title}</h1>
      <div className="details-subhead">
        {type && (
          <span className="details-type">
            {type.icon} {type.name}
          </span>
        )}
        <span>★ {house.rating} ({house.reviews} reviews)</span>
        <span>·</span>
        <span>{house.address}</span>
        {house.superhost && (
          <>
            <span>·</span>
            <span className="badge-superhost-inline">Superhost</span>
          </>
        )}
        {house.superFeatured && (
          <>
            <span>·</span>
            <span className="badge-super-inline">✨ Super Condition</span>
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

          {type && type.conditions?.length > 0 && (
            <>
              <h2>{type.icon} {type.name} conditions</h2>
              {type.description && <p className="details-type-desc">{type.description}</p>}
              <ul className="conditions-list">
                {type.conditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </>
          )}

          {house.superFeatured && superTag && (
            <>
              <h2>✨ Super Condition benefits</h2>
              <ul className="conditions-list conditions-list-super">
                {superTag.conditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </>
          )}

          <h2>Amenities</h2>
          <ul className="amenity-list">
            {house.amenities.map((a) => (
              <li key={a}>✓ {a}</li>
            ))}
          </ul>
        </div>

        <aside className="booking-box">
          {canSwitchMode && (
            <div className="mode-tabs">
              <button
                type="button"
                className={`mode-tab ${billingMode === "daily" ? "active" : ""}`}
                onClick={() => setBillingMode("daily")}
              >
                Daily
              </button>
              <button
                type="button"
                className={`mode-tab ${billingMode === "monthly" ? "active" : ""}`}
                onClick={() => setBillingMode("monthly")}
              >
                Monthly
              </button>
            </div>
          )}

          <p className="booking-price">
            <strong>${unitPrice}</strong> <span>/ {monthly ? "month" : "night"}</span>
          </p>

          {monthly ? (
            <>
              <label>
                Lease length
                <select value={months} onChange={(e) => setMonths(Number(e.target.value))}>
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n} disabled={n < (type?.minLeaseMonths || 1)}>
                      {n} {n === 1 ? "month" : "months"}
                      {n < (type?.minLeaseMonths || 1) ? " (below minimum)" : ""}
                    </option>
                  ))}
                </select>
              </label>
              {type?.minLeaseMonths > 1 && (
                <p className="hint-muted">Minimum {type.minLeaseMonths} months for this category.</p>
              )}
            </>
          ) : (
            <>
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
            </>
          )}

          <div className="price-rows">
            <div className="price-row">
              <span>${unitPrice} × {unitCount} {unitLabel}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Service fee (12%)</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            {securityDeposit > 0 && (
              <div className="price-row">
                <span>Security deposit ({type.securityDepositMonths} mo)</span>
                <span>${securityDeposit.toFixed(2)}</span>
              </div>
            )}
            <div className="price-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleBookNow}
            disabled={monthly ? !canBookMonthly : !canBookDaily || nights <= 0}
          >
            Book now
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleAdd}
            disabled={monthly ? !canBookMonthly : !canBookDaily || nights <= 0}
          >
            {added ? "✓ Added to cart" : "Add to cart"}
          </button>

          {!monthly && nights <= 0 && <p className="hint-error">Pick a check-out date after check-in.</p>}
          {monthly && !canBookMonthly && (
            <p className="hint-error">Monthly rate not available for this listing.</p>
          )}
          {!monthly && !canBookDaily && (
            <p className="hint-error">This category requires a monthly contract.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
