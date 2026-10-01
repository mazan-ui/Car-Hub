const express = require('express');
const Car = require('../models/Car');
const auth = require('../middleware/auth');

const router = express.Router();

// public: all cars (supports ?search=honda)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.search) {
      const text = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: new RegExp(text, 'i') },
        { brand: new RegExp(text, 'i') }
      ];
    }
    const cars = await Car.find(filter).sort({ price: 1 });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: 'Could not load cars' });
  }
});

// public: single car
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(400).json({ message: 'Invalid car id' });
  }
});

// admin only: add, edit, delete
router.post('/', auth, async (req, res) => {
  try {
    const car = await Car.create(req.body);
    res.status(201).json(car);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json({ message: 'Car deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid car id' });
  }
});

module.exports = router;
