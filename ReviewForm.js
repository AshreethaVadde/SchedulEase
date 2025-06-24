import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Review.css';

function ReviewForm({ providerId }) {
  const userId = localStorage.getItem("user_id");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [existingReview, setExistingReview] = useState(null);
  const [eligible, setEligible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchReviewStatus = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/reviews/status/${providerId}/${userId}`);
        const { hasCompletedAppointment, review } = res.data;
        setEligible(hasCompletedAppointment);
        if (review) {
          setExistingReview(review);
          setRating(review.rating);
          setComment(review.comment);
        }
      } catch (err) {
        console.error("Error fetching review status:", err);
      }
    };

    fetchReviewStatus();
  }, [providerId, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setMessage("Rating must be between 1 and 5.");
      return;
    }

    try {
      if (existingReview) {
        await axios.put(`http://localhost:5000/api/reviews/${existingReview.id}`, { rating, comment });
        setMessage("Review updated successfully.");
      } else {
        await axios.post(`http://localhost:5000/api/reviews`, {
          user_id: userId,
          provider_id: providerId,
          rating,
          comment,
        });
        setMessage("Review submitted successfully.");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to submit review.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/reviews/${existingReview.id}`);
      setExistingReview(null);
      setRating(0);
      setComment('');
      setMessage("Review deleted.");
    } catch (err) {
      setMessage("Failed to delete review.");
    }
  };

  if (!eligible) return <p className="review-ineligible">You can review only after completing an appointment.</p>;

  return (
    <div className="review-form-container">
      <h3>{existingReview ? "Edit Your Review" : "Leave a Review"}</h3>

      <form onSubmit={handleSubmit}>
        <label>Rating:</label>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={(hover || rating) >= star ? "star filled" : "star"}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              ★
            </span>
          ))}
        </div>

        <label>Comment:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          placeholder="Write your feedback here..."
        />

        <div className="review-buttons">
          <button type="submit" className="submit-btn">
            {existingReview ? "Update Review" : "Submit Review"}
          </button>
          {existingReview && (
            <button type="button" className="delete-btn" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </form>

      {message && <p className="review-message">{message}</p>}
    </div>
  );
}

export default ReviewForm;


