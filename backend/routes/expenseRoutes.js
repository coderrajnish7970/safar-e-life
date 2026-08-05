const express = require("express");
const Expense = require("../models/Expense");
const Group = require("../models/Group");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { groupId, description, amount, category, splitBetween } = req.body;

    if (!groupId || !description || !amount) {
      return res.status(400).json({
        message: "groupId, description, and amount are required",
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    let finalSplit = splitBetween;

    if (!finalSplit || finalSplit.length === 0) {
      const equalShare = amount / group.members.length;
      finalSplit = group.members.map((memberId) => ({
        user: memberId,
        share: equalShare,
      }));
    }

    const newExpense = await Expense.create({
      group: groupId,
      description,
      amount,
      category,
      paidBy: req.user.id,
      splitBetween: finalSplit,
    });

    res.status(201).json({
      message: "Expense added successfully",
      expense: newExpense,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/group/:groupId", protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate("paidBy", "name email")
      .populate("splitBetween.user", ["name", "email"]);
    res.json({ expenses });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/group/:groupId/balances", protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId });

    const balances = {};

    expenses.forEach((expense) => {
      const paidById = expense.paidBy.toString();
      balances[paidById] = (balances[paidById] || 0) + expense.amount;

      expense.splitBetween.forEach((split) => {
        const userId = split.user.toString();
        balances[userId] = (balances[userId] || 0) - split.share;
      });
    });

    res.json({ balances });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/group/:groupId/settlement", protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId });

    const balances = {};

    expenses.forEach((expense) => {
      const paidById = expense.paidBy.toString();
      balances[paidById] = (balances[paidById] || 0) + expense.amount;

      expense.splitBetween.forEach((split) => {
        const userId = split.user.toString();
        balances[userId] = (balances[userId] || 0) - split.share;
      });
    });

    let creditors = [];
    let debtors = [];

    Object.keys(balances).forEach((userId) => {
      const amount = Math.round(balances[userId] * 100) / 100;
      if (amount > 0.5) {
        creditors.push({ userId, amount });
      } else if (amount < -0.5) {
        debtors.push({ userId, amount: -amount });
      }
    });

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
      const settleAmount = Math.min(creditors[i].amount, debtors[j].amount);

      transactions.push({
        from: debtors[j].userId,
        to: creditors[i].userId,
        amount: Math.round(settleAmount * 100) / 100,
      });

      creditors[i].amount -= settleAmount;
      debtors[j].amount -= settleAmount;

      if (creditors[i].amount < 0.5) i++;
      if (debtors[j].amount < 0.5) j++;
    }

    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/group/:groupId/summary", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const expenses = await Expense.find({ group: req.params.groupId });

    const actualTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const categoryBreakdown = {};
    expenses.forEach((exp) => {
      categoryBreakdown[exp.category] =
        (categoryBreakdown[exp.category] || 0) + exp.amount;
    });

    const estimatedBudget = group.estimatedBudget || 0;
    const difference = estimatedBudget - actualTotal;

    res.json({
      estimatedBudget: estimatedBudget,
      actualTotal: actualTotal,
      difference: difference,
      status: difference >= 0 ? "under budget" : "over budget",
      categoryBreakdown: categoryBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;