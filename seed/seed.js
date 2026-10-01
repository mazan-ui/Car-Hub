// Run with: npm run seed   (deletes old cars and inserts the default ones)
require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('../models/Car');
const cars = require('./defaultCars');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Car.deleteMany({});
    await Car.insertMany(cars);
    console.log('Default cars added:', cars.length);
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
