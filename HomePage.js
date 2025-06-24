import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const categories = [
  {
    name: "Health Care & Wellness",
    image: "/images/health.jpeg",
  },
  {
    name: "Beauty & Grooming",
    image: "/images/beauty.jpg",
  },
  {
    name: "Home Repair Services",
    image: "/images/repair.jpg",
  },
];

function HomePage() {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/providers/${encodeURIComponent(category)}`);
  };

  return (
    <div className="homepage-wrapper">
      <h2 className="homepage-title">Select a Service Category</h2>
      <div className="categories-grid">
        {categories.map((cat, index) => (
          <div
            key={index}
            className="category-card"
            onClick={() => handleCategoryClick(cat.name)}
          >
            <img src={cat.image} alt={cat.name} />
            <h3>{cat.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;

