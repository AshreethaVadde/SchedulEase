const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'admin email',
    pass: 'admin pass gmail'
  }
});

// Register
router.post('/register', async (req, res) => {
  console.log('Body:', req.body);
  console.log('Files:', req.files);
  const { name, email, phone, password, confirmPassword } = req.body;
  const file = req.files?.profile_pic || null;

  if (!name || !email || !phone || !password || !confirmPassword) {
  return res.status(400).json({ error: 'All fields except profile picture are required' });
}


  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  let fileName = null;
if (file) {
  fileName = Date.now() + '_' + file.name;
  const uploads = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploads)) fs.mkdirSync(uploads);
  const filePath = path.join(uploads, fileName);
  file.mv(filePath, err => {
    if (err) return res.status(500).json({ error: 'File upload failed' });
  });
}


  const hashed = await bcrypt.hash(password, 10);
  const profileName = file ? Date.now() + '_' + file.name : null;

  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
  if (file) file.mv(path.join(uploadDir, profileName), () => {});

  db.query(
  'INSERT INTO users (name, email, phone, password, profile_pic, verified) VALUES (?, ?, ?, ?, ?, ?)',
  [name, email, phone, hashed, fileName, false],
  (err) => {
    if (err) return res.status(500).json({ error: 'Email exists' });
    res.json({ message: 'Registered successfully' });
  }
);

});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
    if (err || result.length === 0) return res.status(401).json({ error: 'Invalid email' });
    const user = result[0];
    if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id }, 'secretkey');
    res.json({
      token, user_id: user.id, name: user.name, verified: user.verified,
      profile_pic: user.profile_pic ? `http://localhost:5000/uploads/${user.profile_pic}` : null
    });
  });
});

// Forgot Password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const token = jwt.sign({ email }, 'resetsecret', { expiresIn: '1h' });
  const link = `http://localhost:3000/reset-password/${token}`;
  transporter.sendMail({
    from: 'admin email',
    to: email,
    subject: 'Reset Password',
    text: `Click the link to reset your password: ${link}`
  }, err => {
    if (err) return res.status(500).json({ error: 'Email sending failed' });
    res.json({ message: 'Reset link sent' });
  });
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, password, confirmPassword } = req.body;
  if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords must match' });

  try {
    const { email } = jwt.verify(token, 'resetsecret');
    const hashed = await bcrypt.hash(password, 10);
    db.query('UPDATE users SET password = ? WHERE email = ?', [hashed, email], err => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Password reset successfully' });
    });
  } catch {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});
// Get user profile by ID
// Example backend route (Node.js with MySQL)
router.get('/profile/:user_id', (req, res) => {
  const { user_id } = req.params;
  const sql = 'SELECT name, email, phone, profile_pic FROM users WHERE id = ?';

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to fetch profile" });
    if (result.length === 0) return res.status(404).json({ error: "User not found" });

    res.json(result[0]);
  });
});

// Update user profile
router.put('/profile/:id', (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;
  let profile_pic = null;

  if (req.files && req.files.profile_pic) {
    const pic = req.files.profile_pic;
    profile_pic = Date.now() + '_' + pic.name;
    pic.mv(path.join(__dirname, '../uploads/', profile_pic));
  }

  const query = profile_pic
    ? 'UPDATE users SET name = ?, email = ?, profile_pic = ? WHERE id = ?'
    : 'UPDATE users SET name = ?, email = ? WHERE id = ?';
  const params = profile_pic ? [name, email, profile_pic, userId] : [name, email, userId];

  db.query(query, params, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update profile' });
    res.json({ message: 'Profile updated successfully' });
  });
});


module.exports = router;


