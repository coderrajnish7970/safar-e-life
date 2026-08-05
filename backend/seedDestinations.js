require("dotenv").config();
const mongoose = require("mongoose");
const Destination = require("./models/Destination");

const destinations = [
  {
    name: "Goa",
    state: "Goa",
    description: "Beaches, nightlife, and Portuguese heritage on the west coast.",
    bestFor: ["beach", "nightlife", "relaxation"],
    topFood: ["Goan fish curry", "Bebinca", "Prawn balchao", "Feni cocktails"],
    avgCostPerPersonPerDay: { stay: 1500, food: 800, localTransport: 300 },
  },
  {
    name: "Manali",
    state: "Himachal Pradesh",
    description: "Mountain town in the Himalayas, popular for adventure sports and snow.",
    bestFor: ["mountains", "adventure", "snow"],
    topFood: ["Siddu", "Trout fish", "Thukpa", "Chana Madra"],
    avgCostPerPersonPerDay: { stay: 1200, food: 600, localTransport: 400 },
  },
  {
    name: "Jaipur",
    state: "Rajasthan",
    description: "The Pink City, known for forts, palaces, and royal heritage.",
    bestFor: ["heritage", "culture", "shopping"],
    topFood: ["Dal Baati Churma", "Laal Maas", "Pyaaz Kachori", "Ghewar"],
    avgCostPerPersonPerDay: { stay: 1000, food: 500, localTransport: 250 },
  },
  {
    name: "Rishikesh",
    state: "Uttarakhand",
    description: "Yoga capital of the world, on the banks of the Ganges, popular for adventure and spirituality.",
    bestFor: ["adventure", "spirituality", "nature"],
    topFood: ["Aloo Puri", "Chotiwala Thali", "Sattu Paratha"],
    avgCostPerPersonPerDay: { stay: 900, food: 450, localTransport: 200 },
  },
  {
    name: "Andaman Islands",
    state: "Andaman and Nicobar Islands",
    description: "Tropical islands with pristine beaches and scuba diving spots.",
    bestFor: ["beach", "scuba diving", "island life"],
    topFood: ["Fresh seafood platters", "Coconut prawn curry", "Grilled fish"],
    avgCostPerPersonPerDay: { stay: 2200, food: 1000, localTransport: 500 },
  },
  {
    name: "Munnar",
    state: "Kerala",
    description: "Hill station covered in tea plantations, misty and cool year round.",
    bestFor: ["mountains", "nature", "relaxation"],
    topFood: ["Kerala Sadya", "Appam with stew", "Karimeen fry"],
    avgCostPerPersonPerDay: { stay: 1300, food: 550, localTransport: 350 },
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB, seeding destinations...");

    for (const dest of destinations) {
      await Destination.findOneAndUpdate(
        { name: dest.name },
        dest,
        { upsert: true, new: true }
      );
    }

    console.log("Seeded " + destinations.length + " destinations successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding destinations:", err.message);
    process.exit(1);
  });