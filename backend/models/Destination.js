const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  state: {
    type: String,
  },
  description: {
    type: String,
  },
  bestFor: {
    type: [String],
    default: [],
  },
  topFood: {
    type: [String],
    default: [],
  },
  avgCostPerPersonPerDay: {
    stay: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    localTransport: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model("Destination", destinationSchema);
