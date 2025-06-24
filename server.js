const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());

// ✅ Use this before fileUpload for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));

// ✅ Don't use express.json() before fileUpload
app.use(fileUpload());
app.use('/uploads', express.static('uploads'));

// Create uploads folder if not exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// ✅ Only use express.json() AFTER fileUpload (optional for other JSON routes)
app.use(express.json());

// Routes
const usersRoute = require('./routes/users');
const appointmentsRoute = require('./routes/appointments');
const reviewRoutes = require('./routes/reviews');
const providerRoutes = require('./routes/providers');



app.use('/api/users', usersRoute);
app.use('/api/appointments', appointmentsRoute);

app.use('/api/reviews', reviewRoutes);
app.use('/api/providers', providerRoutes);


// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

