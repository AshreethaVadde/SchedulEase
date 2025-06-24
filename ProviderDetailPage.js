// src/pages/ProviderDetailPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import ReviewDisplay from "../components/ReviewDisplay";

export default function ProviderDetailPage() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/providers/${providerId}`);
        setProvider(res.data);
      } catch (err) {
        setError("Could not load provider details.");
      }
    };
    fetchProvider();
  }, [providerId]);

  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  if (!provider) return <div style={{ padding: '2rem' }}>Loading provider...</div>;

  return (
    <div className="provider-detail-container">
      <h2 className="animated-title">{provider.name}</h2>
      <p className="provider-info"><strong>Category:</strong> {provider.category_name}</p>
      <p className="provider-info"><strong>Address:</strong> {provider.address}</p>
      {provider.image_url && (
        <img
          src={provider.image_url}
          alt={provider.name}
          className="provider-image fade-in"
        />
      )}
      <p className="provider-description"><strong>Description:</strong> {provider.description || "No description available."}</p>

      <hr style={{ margin: "2rem 0" }} />

      {/* Reviews */}
      <ReviewDisplay providerId={provider.id} />
    </div>
  );
}
