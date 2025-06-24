const express = require('express');
const router = express.Router();
const db = require('../db');

// POST - Submit a review
router.post('/', (req, res) => {
  const { user_id, provider_id, rating, comment } = req.body;

  const checkAppointmentSql = `
    SELECT * FROM appointments 
    WHERE user_id = ? AND provider_id = ? AND status = 'completed' 
    LIMIT 1
  `;

  db.query(checkAppointmentSql, [user_id, provider_id], (err, appointmentResults) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (appointmentResults.length === 0) {
      return res.status(403).json({ error: 'You can only review after completing an appointment.' });
    }

    const checkReviewSql = `
      SELECT * FROM reviews WHERE user_id = ? AND provider_id = ?
    `;

    db.query(checkReviewSql, [user_id, provider_id], (err2, reviewResults) => {
      if (err2) return res.status(500).json({ error: 'Error checking existing review' });

      if (reviewResults.length > 0) {
        return res.status(409).json({ error: 'You have already submitted a review for this provider.' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const insertReviewSql = `
        INSERT INTO reviews (user_id, provider_id, rating, comment) 
        VALUES (?, ?, ?, ?)
      `;

      db.query(insertReviewSql, [user_id, provider_id, rating, comment], (err3) => {
        if (err3) return res.status(500).json({ error: 'Failed to submit review' });

        res.json({ message: 'Review submitted successfully' });
      });
    });
  });
});

// PUT - Update a review
router.put('/:reviewId', (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const updateSql = `
    UPDATE reviews 
    SET rating = ?, comment = ?, updated_at = NOW()
    WHERE id = ?
  `;

  db.query(updateSql, [rating, comment, reviewId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update review' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review updated successfully' });
  });
});

// DELETE - Delete a review
router.delete('/:reviewId', (req, res) => {
  const { reviewId } = req.params;

  const deleteSql = `DELETE FROM reviews WHERE id = ?`;

  db.query(deleteSql, [reviewId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete review' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  });
});

// GET - Review eligibility and existing review
router.get('/status/:providerId/:userId', (req, res) => {
  const { providerId, userId } = req.params;

  const checkAppointmentSql = `
    SELECT * FROM appointments 
    WHERE user_id = ? AND provider_id = ? AND status = 'completed' LIMIT 1
  `;

  db.query(checkAppointmentSql, [userId, providerId], (err, appointmentResult) => {
    if (err) return res.status(500).json({ error: 'Error checking appointment' });

    const hasCompletedAppointment = appointmentResult.length > 0;

    const reviewCheckSql = `
      SELECT * FROM reviews 
      WHERE user_id = ? AND provider_id = ? LIMIT 1
    `;
    db.query(reviewCheckSql, [userId, providerId], (err2, reviewResult) => {
      if (err2) return res.status(500).json({ error: 'Error checking review' });

      const review = reviewResult[0] || null;
      res.json({ hasCompletedAppointment, review });
    });
  });
});
// GET /api/providers/:providerId/reviews
// GET all reviews for a provider
router.get('/provider/:providerId', (req, res) => {
  const { providerId } = req.params;

  const sql = `
    SELECT r.*, u.name AS user_name 
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.provider_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(sql, [providerId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch reviews' });

    res.json(results);
  });
});
// GET if a review exists by user for a provider
router.get('/check/:user_id/:provider_id', async (req, res) => {
  const { user_id, provider_id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM reviews WHERE user_id = ? AND provider_id = ?",
      [user_id, provider_id]
    );
    if (rows.length > 0) {
      res.json({ reviewed: true });
    } else {
      res.json({ reviewed: false });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to check review status" });
  }
});


module.exports = router;
