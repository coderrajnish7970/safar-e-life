const express = require("express");
const Destination = require("../models/Destination");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET all destinations
router.get("/", protect, async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.json({ destinations });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET a single destination by name
router.get("/:name", protect, async (req, res) => {
  try {
    const destination = await Destination.findOne({ name: req.params.name });

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    res.json({ destination });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST estimate trip cost for a destination
router.post("/estimate", protect, async (req, res) => {
  try {
    const { destinationName, numPeople, numDays } = req.body;

    if (!destinationName || !numPeople || !numDays) {
      return res.status(400).json({
        message: "destinationName, numPeople, and numDays are required",
      });
    }

    const destination = await Destination.findOne({ name: destinationName });

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    const costs = destination.avgCostPerPersonPerDay;

    const stayCost = costs.stay * numPeople * numDays;
    const foodCost = costs.food * numPeople * numDays;
    const transportCost = costs.localTransport * numPeople * numDays;

    const totalCost = stayCost + foodCost + transportCost;

    res.json({
      destination: destination.name,
      numPeople: numPeople,
      numDays: numDays,
      breakdown: {
        stay: stayCost,
        food: foodCost,
        localTransport: transportCost,
      },
      totalEstimatedCost: totalCost,
      topFood: destination.topFood,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
