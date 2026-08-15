const express = require("express");
const Destination = require("../models/Destination");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET all destinations
router.get("/", protect, async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ name: 1 });

    res.json({ destinations });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// GET a single destination by name
router.get("/:name", protect, async (req, res) => {
  try {
    const destination = await Destination.findOne({
      name: req.params.name,
    });

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    res.json({ destination });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
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

    const people = Number(numPeople);
    const days = Number(numDays);

    if (
      !Number.isFinite(people) ||
      !Number.isFinite(days) ||
      people <= 0 ||
      days <= 0
    ) {
      return res.status(400).json({
        message: "numPeople and numDays must be positive numbers",
      });
    }

    const destination = await Destination.findOne({
      name: destinationName,
    });

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    const costs = destination.avgCostPerPersonPerDay;

    const stayCost = costs.stay * people * days;
    const foodCost = costs.food * people * days;
    const transportCost =
      costs.localTransport * people * days;

    const totalCost =
      stayCost +
      foodCost +
      transportCost;

    res.json({
      destination: destination.name,
      numPeople: people,
      numDays: days,

      breakdown: {
        stay: stayCost,
        food: foodCost,
        localTransport: transportCost,
      },

      totalEstimatedCost: totalCost,

      // Existing information
      topFood: destination.topFood,

      // New destination information
      description: destination.description,
      state: destination.state,
      bestFor: destination.bestFor,
      topAttractions: destination.topAttractions,
      bestSeason: destination.bestSeason,
      recommendedDuration:
        destination.recommendedDuration,

      // New destination story
      destinationStory:
        destination.destinationStory,

      // New detailed information
      geography: destination.geography,
      history: destination.history,
      culture: destination.culture,
      climate: destination.climate,
      travelInfo: destination.travelInfo,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;