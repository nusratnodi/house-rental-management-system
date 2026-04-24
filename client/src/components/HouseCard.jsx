import { Link } from "react-router-dom";
import { formatKm } from "../utils/distance";
import { useData } from "../context/DataContext";

export default function HouseCard({ house, distanceKm, hospitalName }) {
  const { getPropertyType } = useData();
  const type = getPropertyType(house.propertyType);

  return (
    <Link to={`/house/${house.id}`} className="card">
      <div className="card-image-wrap">
        <img src={house.image} alt={house.title} className="card-image" loading="lazy" />
        {house.superFeatured && <span className="badge-super">✨ Super</span>}
        {house.superhost && <span className="badge-superhost">Superhost</span>}
        {distanceKm != null && (
          <span className="badge-distance">📍 {formatKm(distanceKm)} away</span>
        )}
      </div>
      <div className="card-body">
        {type && (
          <span className="card-type">
            <span>{type.icon}</span> {type.name}
          </span>
        )}
        <div className="card-row">
          <h3 className="card-title">{house.title}</h3>
          <span className="card-rating">★ {house.rating}</span>
        </div>
        <p className="card-city">{house.city}</p>
        {hospitalName && distanceKm != null && (
          <p className="card-hospital">🏥 {formatKm(distanceKm)} from {hospitalName}</p>
        )}
        <p className="card-meta">
          {house.guests} guests · {house.bedrooms} bed · {house.bathrooms} bath
        </p>
        <p className="card-price">
          {type?.pricingMode === "monthly" ? (
            <>
              <strong>${house.pricePerMonth}</strong> / month
            </>
          ) : type?.pricingMode === "daily" ? (
            <>
              <strong>${house.pricePerNight}</strong> / night
            </>
          ) : (
            <>
              <strong>${house.pricePerNight}</strong> / night
              {house.pricePerMonth ? <span className="card-alt-price"> · ${house.pricePerMonth}/mo</span> : null}
            </>
          )}
        </p>
      </div>
    </Link>
  );
}
