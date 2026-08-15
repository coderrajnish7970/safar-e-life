const mongoose = require("mongoose");

const destinationStorySchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    credit: {
      type: String,
      default: "",
    },

    sourceUrl: {
      type: String,
      default: "",
    },

    license: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

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

  topAttractions: {
    type: [String],
    default: [],
  },

  bestSeason: {
    type: String,
  },

  recommendedDuration: {
    type: String,
  },

  // Destination knowledge
  geography: {
    type: String,
    default: "",
  },

  history: {
    type: String,
    default: "",
  },

  culture: {
    type: String,
    default: "",
  },

  climate: {
    type: String,
    default: "",
  },

  travelInfo: {
    type: String,
    default: "",
  },

  // 5-10 destination photos/stories
  destinationStory: {
    type: [destinationStorySchema],
    default: [],
  },

  avgCostPerPersonPerDay: {
    stay: {
      type: Number,
      default: 0,
    },

    food: {
      type: Number,
      default: 0,
    },

    localTransport: {
      type: Number,
      default: 0,
    },
  },
});

module.exports = mongoose.model("Destination", destinationSchema);