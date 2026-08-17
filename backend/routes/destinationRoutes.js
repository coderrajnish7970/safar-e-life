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
    const { destination, days } = req.body || {};

    if (!destination || !days) {
      return res.status(400).json({
        message: "destination and days are required",
      });
    }

    const numDays = Math.min(Math.max(Number(days) || 3, 1), 14);

    let aiItinerary = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are TerraYatra AI Travel Concierge. A traveler is visiting "${destination}" for ${numDays} days.
        Automatically determine local attractions, food, route grouping, and experiences.
        Return ONLY valid JSON with NO markdown formatting, NO backticks, matching this exact structure:
        {
          "destination": "${destination}",
          "days": ${numDays},
          "tagline": "Short catchy slogan for ${destination}",
          "estimatedBudgetINR": "₹${numDays * 2200} - ₹${numDays * 4200} per person",
          "bestSeason": "October to March",
          "summary": "Brief 2-sentence trip theme and geographical route optimization overview.",
          "itinerary": [
            {
              "day": 1,
              "title": "Day 1 Theme Title",
              "morning": {
                "place": "Top Landmark Name",
                "details": "Key activity and exploration highlights",
                "whyWorthSeeing": "Why this place is unmissable"
              },
              "lunch": {
                "spot": "Famous Local Restaurant / Food Area",
                "foodToTry": "Must-try local dishes & snacks"
              },
              "afternoon": {
                "place": "Nearby Cultural Attraction",
                "details": "Sightseeing and photo opportunities",
                "whyWorthSeeing": "Cultural or historic significance"
              },
              "evening": {
                "activity": "Sunset Experience & Market Walk",
                "details": "Atmospheric evening stroll or viewpoint"
              },
              "dinner": {
                "spot": "Renowned Dinner Spot",
                "foodToTry": "Signature dinner delicacy & dessert"
              }
            }
          ],
          "finalRecommendation": "Why this trip is custom-crafted to give the ultimate experience in ${destination}."
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
      const sampleLandmarks = [
        { place: "Historic Fort & Monument", food: "Famous Breakfast Puri & Lassi", lunch: "Local Heritage Dhaba", afternoon: "Art Museum & Bazaar", evening: "Sunset Lake View", dinner: "Traditional Thali House" },
        { place: "Architectural Wonders & Temples", food: "Famous Regional Snacks", lunch: "Heritage Courtyard Cafe", afternoon: "Handicrafts Market Stroll", evening: "Cultural Light & Sound Show", dinner: "Rooftop Grill & Biryani" },
        { place: "Scenic Nature Trail / Peak Viewpoint", food: "Local Street Food Delicacies", lunch: "Riverside Bistro", afternoon: "Old Town Heritage Alleyways", evening: "Night Bazaar Shopping", dinner: "Local Specialty Restaurant" }
      ];

      for (let i = 1; i <= numDays; i++) {
        const item = sampleLandmarks[(i - 1) % sampleLandmarks.length];
        fallbackDays.push({
          day: i,
          title: `Day ${i}: Best of ${destination} Highlights`,
          morning: {
            place: `${destination} ${item.place}`,
            details: `Explore the iconic architecture and morning atmosphere of ${destination}.`,
            whyWorthSeeing: `Highly rated landmark representing the essence of ${destination}.`
          },
          lunch: {
            spot: `${destination} ${item.lunch}`,
            foodToTry: item.food
          },
          afternoon: {
            place: `${destination} ${item.afternoon}`,
            details: `Immerse in local artisan markets and historic quarters.`,
            whyWorthSeeing: `Vibrant culture and unique local craftsmanship.`
          },
          evening: {
            activity: item.evening,
            details: `Enjoy relaxed twilight views and evening strolls.`
          },
          dinner: {
            spot: `${destination} ${item.dinner}`,
            foodToTry: "Signature regional delicacies and local dessert"
          }
        });
      }

      aiItinerary = {
        destination,
        days: numDays,
        tagline: `Discover the unforgettable magic of ${destination}`,
        estimatedBudgetINR: `₹${numDays * 2000} - ₹${numDays * 3500} per person`,
        bestSeason: "October to March",
        summary: `A carefully optimized ${numDays}-day itinerary grouping nearby attractions to maximize your time in ${destination}.`,
        itinerary: fallbackDays,
        finalRecommendation: `This itinerary combines top landmarks with authentic local food spots in ${destination}, ensuring minimal transit time and maximum enjoyment!`
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