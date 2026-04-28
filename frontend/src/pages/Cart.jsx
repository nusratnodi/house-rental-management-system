import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function itemSubtotal(item) {
  if (item.billingMode === "monthly") {
    return (item.house.pricePerMonth || 0) * (item.months || 0);
  }
  return (item.house.pricePerNight || 0) * (item.nights || 0);
}

function itemDeposit(item, type) {
  if (item.billingMode !== "monthly" || !type?.securityDepositMonths) return 0;
  return (item.house.pricePerMonth || 0) * type.securityDepositMonths;
}

export default function Cart() {
  const { cart, removeFromCart, updateCartItem, placeOrder } = useCart();
  const { currentUser } = useAuth();
  const { getPropertyType, propertyTypes } = useData();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [guest, setGuest] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
  });
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const superTag = propertyTypes.find((t) => t.id === "super" && t.kind === "tag");

  const enrichedCart = useMemo(
    () =>
      cart.map((item) => {
        const type = getPropertyType(item.house.propertyType);
        return { item, type };
      }),
    [cart, getPropertyType]
  );

  const subtotal = cart.reduce((sum, item) => sum + itemSubtotal(item), 0);
  const serviceFee = +(subtotal * 0.12).toFixed(2);
  const deposits = enrichedCart.reduce(
    (sum, { item, type }) => sum + itemDeposit(item, type),
    0
  );
  const total = +(subtotal + serviceFee + deposits).toFixed(2);

  function handleDateChange(item, field, value) {
    const next = { ...item, [field]: value };
    const nights = nightsBetween(next.checkIn, next.checkOut);
    const subtotalVal = (item.house.pricePerNight || 0) * nights;
    updateCartItem(item.house.id, {
      checkIn: next.checkIn,
      checkOut: next.checkOut,
      nights,
      subtotal: subtotalVal,
    });
  }

  function handleMonthsChange(item, value) {
    const months = Math.max(1, Number(value) || 1);
    const subtotalVal = (item.house.pricePerMonth || 0) * months;
    const type = getPropertyType(item.house.propertyType);
    const deposit = type?.securityDepositMonths
      ? (item.house.pricePerMonth || 0) * type.securityDepositMonths
      : 0;
    updateCartItem(item.house.id, {
      months,
      subtotal: subtotalVal,
      securityDeposit: deposit,
    });
  }

  function updateAgreement(item, field, value) {
    updateCartItem(item.house.id, {
      agreement: { ...(item.agreement || {}), [field]: value },
    });
  }

  function itemIssues({ item, type }) {
    const issues = [];
    if (!item.agreement?.agreed) issues.push("Please agree to the category conditions.");
    if (type?.requiresIdVerification) {
      const id = item.agreement?.idNumber?.trim();
      if (!id || id.length < 4) issues.push("Government ID number is required.");
    }
    if (type?.tenantGenderRule && type.tenantGenderRule !== "any") {
      if (item.agreement?.tenantGender !== type.tenantGenderRule) {
        issues.push(
          `This category accepts ${type.tenantGenderRule} tenants only. Please confirm.`
        );
      }
    }
    if (item.billingMode === "monthly") {
      if ((item.months || 0) < (type?.minLeaseMonths || 1)) {
        issues.push(`Minimum lease is ${type?.minLeaseMonths || 1} months.`);
      }
    } else {
      if ((item.nights || 0) <= 0) issues.push("Pick a valid check-in and check-out date.");
    }
    return issues;
  }

  const allIssues = enrichedCart.map((entry) => ({
    houseId: entry.item.house.id,
    issues: itemIssues(entry),
  }));
  const hasBlockingIssues = allIssues.some((x) => x.issues.length > 0);

  function handlePlaceOrder(e) {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (!guest.name || !guest.email) return;
    if (hasBlockingIssues) return;
    const order = placeOrder(guest);
    if (order) navigate("/orders");
  }

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p>Browse stays and add some to your cart.</p>
          <Link to="/" className="btn btn-primary">Browse stays</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Your Cart</h1>

      <div className="cart-grid">
        <div className="cart-items">
          {enrichedCart.map(({ item, type }) => {
            const monthly = item.billingMode === "monthly";
            const itemTotal = itemSubtotal(item);
            const deposit = itemDeposit(item, type);
            const issues = attemptedSubmit ? itemIssues({ item, type }) : [];

            return (
              <div key={item.house.id} className="cart-item">
                <img src={item.house.image} alt={item.house.title} className="cart-item-img" />
                <div className="cart-item-body">
                  <div className="cart-item-head">
                    <Link to={`/house/${item.house.id}`} className="cart-item-title">
                      {item.house.title}
                    </Link>
                    {type && (
                      <span className="cart-type-pill">
                        {type.icon} {type.name}
                      </span>
                    )}
                  </div>
                  <p className="cart-item-city">{item.house.city}</p>

                  {monthly ? (
                    <div className="cart-dates">
                      <label>
                        Lease length
                        <select
                          value={item.months || 1}
                          onChange={(e) => handleMonthsChange(item, e.target.value)}
                        >
                          {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                            <option
                              key={n}
                              value={n}
                              disabled={n < (type?.minLeaseMonths || 1)}
                            >
                              {n} {n === 1 ? "month" : "months"}
                              {n < (type?.minLeaseMonths || 1) ? " (below minimum)" : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ) : (
                    <div className="cart-dates">
                      <label>
                        Check-in
                        <input
                          type="date"
                          value={item.checkIn}
                          onChange={(e) => handleDateChange(item, "checkIn", e.target.value)}
                        />
                      </label>
                      <label>
                        Check-out
                        <input
                          type="date"
                          value={item.checkOut}
                          min={item.checkIn}
                          onChange={(e) => handleDateChange(item, "checkOut", e.target.value)}
                        />
                      </label>
                    </div>
                  )}

                  <p className="cart-item-meta">
                    {monthly ? (
                      <>
                        ${item.house.pricePerMonth} × {item.months}{" "}
                        {item.months === 1 ? "month" : "months"}
                      </>
                    ) : (
                      <>
                        ${item.house.pricePerNight} × {item.nights}{" "}
                        {item.nights === 1 ? "night" : "nights"}
                      </>
                    )}{" "}
                    = <strong>${itemTotal.toFixed(2)}</strong>
                  </p>
                  {deposit > 0 && (
                    <p className="cart-item-meta cart-item-deposit">
                      + Security deposit ({type.securityDepositMonths} mo): <strong>${deposit.toFixed(2)}</strong>
                    </p>
                  )}

                  {type && (
                    <div className="conditions-box">
                      <div className="conditions-box-head">
                        <strong>{type.icon} {type.name} — required conditions</strong>
                      </div>
                      <ul className="conditions-list">
                        {type.conditions.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>

                      {item.house.superFeatured && superTag && (
                        <div className="conditions-super">
                          <strong>✨ Super Condition:</strong>
                          <ul className="conditions-list conditions-list-super">
                            {superTag.conditions.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="conditions-form">
                        {type.tenantGenderRule && type.tenantGenderRule !== "any" && (
                          <label className="conditions-field">
                            Tenant gender
                            <select
                              value={item.agreement?.tenantGender || ""}
                              onChange={(e) => updateAgreement(item, "tenantGender", e.target.value)}
                            >
                              <option value="">Select…</option>
                              <option value="female">Female</option>
                              <option value="male">Male</option>
                            </select>
                          </label>
                        )}
                        {type.requiresIdVerification && (
                          <label className="conditions-field">
                            Government ID number
                            <input
                              type="text"
                              placeholder="NID / Passport"
                              value={item.agreement?.idNumber || ""}
                              onChange={(e) => updateAgreement(item, "idNumber", e.target.value)}
                            />
                          </label>
                        )}
                      </div>

                      <label className="conditions-agree">
                        <input
                          type="checkbox"
                          checked={!!item.agreement?.agreed}
                          onChange={(e) => updateAgreement(item, "agreed", e.target.checked)}
                        />
                        I have read and agree to the {type.name} conditions above.
                      </label>

                      {issues.length > 0 && (
                        <ul className="conditions-errors">
                          {issues.map((msg, i) => (
                            <li key={i}>{msg}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <button
                    className="btn-link-danger"
                    onClick={() => removeFromCart(item.house.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="cart-summary">
          <h2>Summary</h2>
          <div className="price-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span>Service fee (12%)</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          {deposits > 0 && (
            <div className="price-row">
              <span>Security deposits</span>
              <span>${deposits.toFixed(2)}</span>
            </div>
          )}
          <div className="price-row total">
            <span>Total due</span>
            <span>${total.toFixed(2)}</span>
          </div>

          {!showCheckout ? (
            <button
              className="btn btn-primary"
              onClick={() => setShowCheckout(true)}
              disabled={subtotal <= 0}
            >
              Proceed to checkout
            </button>
          ) : (
            <form onSubmit={handlePlaceOrder} className="checkout-form">
              <h3>Guest details</h3>
              <label>
                Full name
                <input
                  required
                  type="text"
                  value={guest.name}
                  onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={guest.email}
                  onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                />
              </label>
              <label>
                Phone
                <input
                  type="tel"
                  value={guest.phone}
                  onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                />
              </label>

              {attemptedSubmit && hasBlockingIssues && (
                <p className="hint-error">
                  Some items are missing required info — scroll up to complete them.
                </p>
              )}

              <button type="submit" className="btn btn-primary">
                Confirm &amp; place order
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}
