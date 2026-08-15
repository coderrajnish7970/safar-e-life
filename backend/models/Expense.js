const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["food", "travel", "stay", "activities", "misc"],
      default: "misc",
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    splitMode: {
      type: String,
      enum: ["equal", "custom"],
      default: "equal",
    },
    splitBetween: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        share: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

expenseSchema.index({ group: 1 });
expenseSchema.index({ paidBy: 1 });

module.exports = mongoose.model("Expense", expenseSchema);
