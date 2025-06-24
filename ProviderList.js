// ProviderList.js
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProviderList.css";

const providerData = {
  "Health Care & Wellness": [
    {
      id: 1,
      name: "City Health Clinic",
      address: "Vijaya Talkies, Hanamkonda",
      image: "/images/clinic1.jpeg",
    },
    {
      id: 2,
      name: "Apollo Hospital",
      address: "Mandi Bazar, Warangal",
      image: "/images/apollo.jpeg",
    },
  ],
  "Beauty & Grooming": [
    {
      id: 3,
      name: "Glamour Salon",
      address: "Pochammaidan, Warangal",
      image: "/images/salon1.jpeg",
    },
    {
      id: 4,
      name: "Naturals",
      address: "Nakkalgutta, Hanamkonda",
      image: "/images/naturals.jpeg",
    },
  ],
  "Home Repair Services": [
    {
      id: 5,
      name: "FixItPro",
      address: "Warangal Bus Stand",
      image: "/images/electrician.jpeg",
    },
    {
      id: 6,
      name: "RepairHub",
      address: "Hanamkonda Chowrasta",
      image: "/images/plumber.jpeg",
    },
  ],
};

function ProviderList() {
  const { category } = useParams();
  const navigate = useNavigate();

  const providers = providerData[decodeURIComponent(category)] || [];

  const handleBook = (providerId) => {
    navigate(`/book/${providerId}`);
  };

  const handleViewDetails = (providerId) => {
    navigate(`/provider/${providerId}`);
  };

  return (
    <div className="provider-container">
      <h2>Providers for: {decodeURIComponent(category)}</h2>
      <div className="provider-grid">
        {providers.map((provider) => (
          <div key={provider.id} className="provider-card">
            <img src={provider.image} alt={provider.name} />
            <h3>{provider.name}</h3>
            <p>{provider.address}</p>
            <div className="button-row">
              <button onClick={() => handleBook(provider.id)}>Book Now</button>
              <button onClick={() => navigate(`/provider/${provider.id}`)}>View Details</button>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProviderList;



