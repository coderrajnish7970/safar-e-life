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

// POST generate custom AI itinerary
router.post("/ai-itinerary", protect, async (req, res) => {
  try {
    const { destination, days, travelStyle } = req.body || {};

    if (!destination || !days) {
      return res.status(400).json({
        message: "destination and days are required",
      });
    }

    const numDays = Math.min(Math.max(Number(days) || 3, 1), 14);
    const style = travelStyle || "balanced";

    let aiItinerary = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are Safar-E-Life AI Travel Concierge. A traveler is visiting "${destination}" for ${numDays} days with travel style "${style}".
        Generate a detailed day-by-day itinerary with exact activities, food spots, and evening experiences.
        Return ONLY valid JSON with no markdown formatting, no codeblocks, matching this structure:
        {
          "destination": "${destination}",
          "days": ${numDays},
          "tagline": "Short catchy travel slogan for ${destination}",
          "estimatedBudgetINR": "₹${numDays * 2500} - ₹${numDays * 4500} per person",
          "bestSeason": "October to March",
          "itinerary": [
            {
              "day": 1,
              "title": "Day 1 Highlight Title",
              "morning": "🏛️ Morning activity details",
              "afternoon": "🍛 Local food & lunch spot",
              "evening": "🌆 Sunset view & evening experience"
            }
          ],
          "proTips": [
            "Book entry tickets in advance",
            "Try local street delicacies",
            "Keep digital copies of IDs"
          ]
        }`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        aiItinerary = JSON.parse(cleaned);
      } catch (geminiErr) {
        console.error("Gemini AI API notice:", geminiErr.message);
      }
    }

    // Fallback Generator if AI key is missing or parsing failed
    if (!aiItinerary) {
      const fallbackDays = [];
      const activitiesByStyle = {
        heritage: ["Ancient Forts & Palaces", "Museum Tour & Heritage Walk", "Light & Sound Show"],
        foodie: ["Famous Breakfast Joint", "Street Food Culinary Walk", "Rooftop Dinner"],
        nature: ["Scenic Sunrise Point", "Botanical Garden & Lake Drive", "Stargazing Viewpoint"],
        adventure: ["Trekking Trail & Viewpoint", "Water Sports / Zipline", "Campfire & Night Trail"],
        balanced: ["Historic Landmark Visit", "Local Bazaar & Food Walk", "Cultural Sunset Experience"]
      };

      const selectedActs = activitiesByStyle[style.toLowerCase()] || activitiesByStyle.balanced;

      for (let i = 1; i <= numDays; i++) {
        fallbackDays.push({
          day: i,
          title: `Day ${i}: Exploring ${destination} Highlights`,
          morning: `🏛️ Morning: Visit top historic site & early morning sightseeing in ${destination}`,
          afternoon: `🍛 Afternoon: Enjoy authentic local cuisine at famous eateries`,
          evening: `🌆 Evening: ${selectedActs[i % selectedActs.length]} & local bazaar stroll`
        });
      }

      aiItinerary = {
        destination,
        days: numDays,
        tagline: `Discover the breathtaking magic of ${destination}`,
        estimatedBudgetINR: `₹${numDays * 2000} - ₹${numDays * 3500} per person`,
        bestSeason: "October to March",
        itinerary: fallbackDays,
        proTips: [
          `Carry comfortable walking shoes for ${destination}`,
          "Keep local cash handy for street food and auto-rickshaws",
          "Book popular attraction tickets early to skip queues"
        ]
      };
    }

    res.json({ itinerary: aiItinerary });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;