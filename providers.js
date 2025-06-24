const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Register Provider
router.post('/register', async (req, res) => {
  const { name, email, password, category_id, description } = req.body;
  const files = req.files;
  const hashed = await bcrypt.hash(password, 10);

  const imageNames = [];
  ['image1', 'image2', 'image3'].forEach(key => {
    if (files[key]) {
      const img = files[key];
      const imgName = Date.now() + '_' + img.name;
      img.mv(path.join(__dirname, '../uploads/', imgName));
      imageNames.push(imgName);
    } else {
      imageNames.push(null);
    }
  });

  db.query('INSERT INTO providers (name, email, password, category_id, description, image1, image2, image3) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, email, hashed, category_id, description, ...imageNames],
    (err) => {
      if (err) return res.status(500).json({ error: 'Provider registration failed' });
      res.json({ message: 'Provider registered successfully' });
    });
});

// Get Providers by Category
router.get('/by-category/:categoryId', (req, res) => {
  const categoryId = req.params.categoryId;
  db.query('SELECT * FROM providers WHERE category_id = ?', [categoryId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch providers' });
    res.json(results);
  });
});
// Add this at bottom of routes/providers.js
router.get('/categories', (req, res) => {
  db.query('SELECT * FROM categories', (err, results) => {
    if (err) return res.status(500).json({ error: 'Could not load categories' });
    res.json(results);
  });
});
// GET single provider by ID
router.get('/:id', (req, res) => {
  const providerId = req.params.id;

  const sql = `
    SELECT p.*, c.name AS category_name 
    FROM providers p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `;

  db.query(sql, [providerId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).json({ error: 'Failed to fetch provider details' });
    }
    res.json(result[0]);
  });
});
// Get all reviews for a provider
router.get('/:providerId/reviews', (req, res) => {
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
// GET provider by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.execute(
      `SELECT p.*, c.name AS category_name
       FROM providers p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`, [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching provider:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
