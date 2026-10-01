// Car Hub - server (made by Mazan)
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

const Car = require('./models/Car');
const defaultCars = require('./seed/defaultCars');

const app = express();
app.use(express.json({ limit: '4mb' })); // admin can upload small images as base64
app.use(express.static(path.join(__dirname, 'public')));

// connect once and reuse (needed for Vercel serverless)
let connecting = null;
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing in environment variables');
  if (!connecting) {
    connecting = mongoose.connect(process.env.MONGODB_URI).then(async () => {
      // first run: put the 3 default cars in the database
      if ((await Car.countDocuments()) === 0) await Car.insertMany(defaultCars);
    });
  }
  await connecting;
}

app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    connecting = null;
    console.error('Database error:', err.message);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// numbers are kept on the backend only
app.get('/api/config', (req, res) => {
  res.json({
    whatsapp: process.env.WHATSAPP_NUMBER || '923104959769',
    phone: process.env.CONTACT_PHONE || '03475536181'
  });
});

app.use('/api/cars', require('./routes/cars'));
app.use('/api/admin', require('./routes/admin'));

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

const port = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`Car Hub running on http://localhost:${port}`));
}

module.exports = app;
