import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Review.css';

function ReviewDisplay({ providerId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/reviews/provider/${providerId}`);
        setReviews(res.data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      }
    };

    fetchReviews();
  }, [providerId]);

  return (
    <div className="review-display">
      <h3>User Reviews</h3>
      {reviews.length === 0 ? (
        <p className="no-reviews">No reviews yet.</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="review-card">
            <p className="review-username"><strong>{review.user_name}</strong></p>
            <div className="review-stars">
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  key={index}
                  className={index < review.rating ? 'star filled' : 'star'}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="review-comment">{review.comment}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default ReviewDisplay;

