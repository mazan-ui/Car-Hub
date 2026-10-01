// Car model - Car Hub (made by Mazan)
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    priceNote: { type: String, default: 'Starting price (ex-factory)' },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    engine: { type: String, default: '' },
    transmission: { type: String, default: '' },
    fuel: { type: String, default: 'Petrol' },
    mileage: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Car', carSchema);
