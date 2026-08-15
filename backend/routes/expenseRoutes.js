const express = require("express");
const Expense = require("../models/Expense");
const Group = require("../models/Group");
const User = require("../models/User");
const Settlement = require("../models/Settlement");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE EXPENSE
router.post("/", protect, async (req, res) => {
  try {
    const {
      groupId,
      description,
      amount,
      category,
      splitBetween,
      splitMode,
    } = req.body;

    if (!groupId || !description || amount === undefined || amount === null) {
      return res.status(400).json({
        message: "groupId, description, and amount are required",
      });
    }

    if (Number(amount) <= 0 || !Number.isFinite(Number(amount))) {
      return res.status(400).json({
        message: "Amount must be a positive number",
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    let finalSplit = splitBetween;

    if (!finalSplit || finalSplit.length === 0) {
      const totalCents = Math.round(Number(amount) * 100);
      const memberCount = group.members.length;
      const baseCents = Math.floor(totalCents / memberCount);
      let remainder = totalCents - baseCents * memberCount;

      finalSplit = group.members.map((memberId, index) => {
        const shareCents = baseCents + (index < remainder ? 1 : 0);
        return {
          user: memberId,
          share: shareCents / 100,
        };
      });
    }

    const newExpense = await Expense.create({
      group: groupId,
      description,
      amount,
      category,
      paidBy: req.user.id,
      splitMode: splitMode || "equal",
      splitBetween: finalSplit,
    });

    res.status(201).json({
      message: "Expense added successfully",
      expense: newExpense,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// UPDATE AN EXPENSE
router.put("/:id", protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    const group = await Group.findById(expense.group);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    if (expense.paidBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the person who paid can edit this expense",
      });
    }

    const { description, amount, category } = req.body;
    const newAmount = Number(amount || expense.amount);

    let newSplit;

    if (expense.splitMode === "custom") {
      const oldSplitTotal = expense.splitBetween.reduce(
        (sum, split) => sum + Number(split.share || 0),
        0
      );

      if (oldSplitTotal > 0) {
        newSplit = expense.splitBetween.map((split) => ({
          user: split.user,
          share: Number(
            ((Number(split.share || 0) / oldSplitTotal) * newAmount).toFixed(2)
          ),
        }));

        const roundedTotal = newSplit.reduce(
          (sum, split) => sum + split.share,
          0
        );

        const difference = Number((newAmount - roundedTotal).toFixed(2));

        if (newSplit.length > 0 && difference !== 0) {
          newSplit[newSplit.length - 1].share = Number(
            (newSplit[newSplit.length - 1].share + difference).toFixed(2)
          );
        }
      } else {
        const memberCount = group.members.length;
        const equalShare = Math.floor((newAmount / memberCount) * 100) / 100;
        const remainder = Number((newAmount - equalShare * memberCount).toFixed(2));

        newSplit = group.members.map((memberId, index) => ({
          user: memberId,
          share: index === memberCount - 1
            ? Number((equalShare + remainder).toFixed(2))
            : equalShare,
        }));
      }
    } else {
      const memberCount = group.members.length;
      const equalShare = Math.floor((newAmount / memberCount) * 100) / 100;
      const remainder = Number((newAmount - equalShare * memberCount).toFixed(2));

      newSplit = group.members.map((memberId, index) => ({
        user: memberId,
        share: index === memberCount - 1
          ? Number((equalShare + remainder).toFixed(2))
          : equalShare,
      }));
    }

    expense.description = description || expense.description;
    expense.amount = newAmount;
    expense.category = category || expense.category;
    expense.splitBetween = newSplit;

    await expense.save();

    res.json({
      message: "Expense updated successfully",
      expense: expense,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// DELETE AN EXPENSE
router.delete("/:id", protect, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    const group = await Group.findById(expense.group);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    if (expense.paidBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the person who paid can delete this expense",
      });
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.json({
      message: "Expense deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// GET EXPENSES
router.get("/group/:groupId", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    const expenses = await Expense.find({
      group: req.params.groupId,
    })
      .populate("paidBy", "name email")
      .populate("splitBetween.user", ["name", "email"]);

    const sanitizedExpenses = expenses.map((exp) => {
      const expObj = exp.toObject();
      if (
        expObj.splitMode !== "custom" &&
        Array.isArray(expObj.splitBetween) &&
        expObj.splitBetween.length > 0
      ) {
        const totalCents = Math.round(Number(expObj.amount) * 100);
        const count = expObj.splitBetween.length;
        const baseCents = Math.floor(totalCents / count);
        let remainder = totalCents - baseCents * count;

        expObj.splitBetween = expObj.splitBetween.map((split, idx) => ({
          ...split,
          share: (baseCents + (idx < remainder ? 1 : 0)) / 100,
        }));
      }
      return expObj;
    });

    res.json({ expenses: sanitizedExpenses });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// GET BALANCES
router.get("/group/:groupId/balances", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    const expenses = await Expense.find({
      group: req.params.groupId,
    });
    const settlements = await Settlement.find({
      group: req.params.groupId,
    });

    const balances = {};

    expenses.forEach((expense) => {
      const paidById = expense.paidBy.toString();
      balances[paidById] = (balances[paidById] || 0) + expense.amount;

      expense.splitBetween.forEach((split) => {
        const userId = split.user.toString();
        balances[userId] = (balances[userId] || 0) - split.share;
      });
    });

    settlements.forEach((s) => {
      const fromId = s.fromUser.toString();
      const toId = s.toUser.toString();
      balances[fromId] = (balances[fromId] || 0) + s.amount;
      balances[toId] = (balances[toId] || 0) - s.amount;
    });

    res.json({ balances });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// GET SETTLEMENT
router.get("/group/:groupId/settlement", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    const expenses = await Expense.find({
      group: req.params.groupId,
    });

    const settlements = await Settlement.find({
      group: req.params.groupId,
    });

    const balances = {};

    expenses.forEach((expense) => {
      const paidById = expense.paidBy.toString();
      balances[paidById] = (balances[paidById] || 0) + expense.amount;

      expense.splitBetween.forEach((split) => {
        const userId = split.user.toString();
        balances[userId] = (balances[userId] || 0) - split.share;
      });
    });

    settlements.forEach((s) => {
      const fromId = s.fromUser.toString();
      const toId = s.toUser.toString();
      balances[fromId] = (balances[fromId] || 0) + s.amount;
      balances[toId] = (balances[toId] || 0) - s.amount;
    });

    let creditors = [];
    let debtors = [];

    Object.keys(balances).forEach((userId) => {
      const amount = Math.round(balances[userId] * 100) / 100;

      if (amount > 0.5) {
        creditors.push({
          userId,
          amount,
        });
      } else if (amount < -0.5) {
        debtors.push({
          userId,
          amount: -amount,
        });
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

    const userIds = [
      ...new Set(transactions.flatMap((t) => [t.from, t.to])),
    ];

    const users = await User.find({
      _id: { $in: userIds },
    }).select("_id name");

    const userMap = {};

    users.forEach((user) => {
      userMap[user._id.toString()] = user.name;
    });

    const transactionsWithNames = transactions.map((t) => ({
      ...t,
      fromName: userMap[t.from] || t.from,
      toName: userMap[t.to] || t.to,
    }));

    res.json({
      transactions: transactionsWithNames,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// RECORD A SETTLEMENT (MARK AS PAID)
router.post("/group/:groupId/settle", protect, async (req, res) => {
  try {
    const { fromUser, toUser, amount } = req.body;

    if (!fromUser || !toUser || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: "fromUser, toUser, and a positive amount are required",
      });
    }

    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    const settlement = await Settlement.create({
      group: req.params.groupId,
      fromUser,
      toUser,
      amount: Number(amount),
      settledBy: req.user.id,
    });

    res.status(201).json({
      message: "Payment settled successfully",
      settlement,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// GET SETTLEMENT HISTORY
router.get("/group/:groupId/settlements", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    const settlements = await Settlement.find({ group: req.params.groupId })
      .populate("fromUser", "name email")
      .populate("toUser", "name email")
      .populate("settledBy", "name")
      .sort({ createdAt: -1 });

    res.json({ settlements });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// GET SUMMARY
router.get("/group/:groupId/summary", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    const expenses = await Expense.find({
      group: req.params.groupId,
    });

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
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// GET RULE-BASED SPENDING INSIGHTS
router.get("/group/:groupId/insights", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate(
      "members",
      "name"
    );

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (member) => member._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    const expenses = await Expense.find({
      group: req.params.groupId,
    }).populate("paidBy", "name");

    const insights = [];

    if (expenses.length === 0) {
      return res.json({
        insights: ["No expenses yet. Add some to see spending insights."],
      });
    }

    const actualTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categoryBreakdown = {};

    expenses.forEach((exp) => {
      categoryBreakdown[exp.category] =
        (categoryBreakdown[exp.category] || 0) + exp.amount;
    });

    let topCategory = null;
    let topCategoryAmount = 0;

    Object.keys(categoryBreakdown).forEach((cat) => {
      if (categoryBreakdown[cat] > topCategoryAmount) {
        topCategory = cat;
        topCategoryAmount = categoryBreakdown[cat];
      }
    });

    if (topCategory) {
      const percent = Math.round((topCategoryAmount / actualTotal) * 100);
      insights.push(
        topCategory.charAt(0).toUpperCase() +
          topCategory.slice(1) +
          " accounts for " +
          percent +
          "% of total spending (Rs " +
          topCategoryAmount +
          ")."
      );
    }

    const estimatedBudget = group.estimatedBudget || 0;

    if (estimatedBudget > 0) {
      const percentOfBudget = Math.round((actualTotal / estimatedBudget) * 100);

      if (actualTotal > estimatedBudget) {
        const overAmount = actualTotal - estimatedBudget;
        insights.push(
          "You are " +
            (percentOfBudget - 100) +
            "% over budget, by Rs " +
            overAmount +
            "."
        );

        if (topCategory) {
          insights.push(
            "Reducing " +
              topCategory +
              " spend by Rs " +
              overAmount +
              " would bring this trip back within budget."
          );
        }
      } else {
        const underAmount = estimatedBudget - actualTotal;
        insights.push(
          "You are on track, Rs " +
            underAmount +
            " under budget (" +
            percentOfBudget +
            "% used)."
        );
      }
    }

    const paidTotals = {};

    expenses.forEach((exp) => {
      const payerId = exp.paidBy._id.toString();
      const payerName = exp.paidBy.name;

      if (!paidTotals[payerId]) {
        paidTotals[payerId] = {
          name: payerName,
          total: 0,
        };
      }

      paidTotals[payerId].total += exp.amount;
    });

    const payers = Object.values(paidTotals);

    if (payers.length > 1) {
      payers.sort((a, b) => b.total - a.total);
      const topPayer = payers[0];
      const topPayerPercent = Math.round((topPayer.total / actualTotal) * 100);

      insights.push(
        topPayer.name +
          " has paid for " +
          topPayerPercent +
          "% of all expenses so far."
      );
    }

    const avgPerMember =
      group.members.length > 0
        ? Math.round(actualTotal / group.members.length)
        : 0;

    insights.push(
      "Average spend per member so far: Rs " + avgPerMember + "."
    );

    res.json({ insights });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// POST ASK A QUESTION ABOUT A GROUP'S SPENDING USING GEMINI
router.post("/group/:groupId/ask", protect, async (req, res) => {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const question = req.body.question;

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "question is required",
      });
    }

    const group = await Group.findById(req.params.groupId).populate(
      "members",
      "name"
    );

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const isMember = group.members.some(
      (member) => member._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    const expenses = await Expense.find({
      group: req.params.groupId,
    })
      .populate("paidBy", "name")
      .populate("splitBetween.user", "name");

    const actualTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const estimatedBudget = group.estimatedBudget || 0;
    const remainingBudget = estimatedBudget - actualTotal;
    const budgetUsedPercent =
      estimatedBudget > 0
        ? Math.round((actualTotal / estimatedBudget) * 100)
        : 0;

    const categoryBreakdown = {};
    expenses.forEach((exp) => {
      const category = exp.category || "misc";
      categoryBreakdown[category] =
        (categoryBreakdown[category] || 0) + exp.amount;
    });

    let topCategory = "None";
    let topCategoryAmount = 0;

    Object.keys(categoryBreakdown).forEach((category) => {
      if (categoryBreakdown[category] > topCategoryAmount) {
        topCategory = category;
        topCategoryAmount = categoryBreakdown[category];
      }
    });

    const paidTotals = {};
    expenses.forEach((exp) => {
      if (exp.paidBy) {
        const name = exp.paidBy.name || "Unknown";
        paidTotals[name] = (paidTotals[name] || 0) + exp.amount;
      }
    });

    const balances = {};
    expenses.forEach((expense) => {
      if (expense.paidBy && expense.paidBy._id) {
        const paidById = expense.paidBy._id.toString();
        balances[paidById] = (balances[paidById] || 0) + expense.amount;
      }

      if (Array.isArray(expense.splitBetween)) {
        expense.splitBetween.forEach((split) => {
          if (split.user && split.user._id) {
            const userId = split.user._id.toString();
            balances[userId] = (balances[userId] || 0) - (split.share || 0);
          }
        });
      }
    });

    const nameById = {};
    group.members.forEach((member) => {
      if (member && member._id) {
        nameById[member._id.toString()] = member.name || "Member";
      }
    });

    const balanceLines = Object.keys(balances).map((id) => {
      const amount = Math.round(balances[id] * 100) / 100;
      const memberName = nameById[id] || "Member";
      if (amount >= 0) {
        return memberName + ": is owed Rs " + amount;
      }
      return memberName + ": owes Rs " + Math.abs(amount);
    });

    const expenseLines = expenses.map(
      (exp) =>
        "- " +
        exp.description +
        ": Rs " +
        exp.amount +
        " (" +
        (exp.category || "misc") +
        "), paid by " +
        (exp.paidBy ? exp.paidBy.name : "Member")
    );

    const contextData =
      "TRIP INFORMATION\n" +
      "Trip: " + group.name + "\n" +
      "Estimated budget: Rs " + estimatedBudget + "\n" +
      "Total spent: Rs " + actualTotal + "\n" +
      "Remaining budget: Rs " + remainingBudget + "\n" +
      "Budget used: " + budgetUsedPercent + "%\n" +
      "Budget status: " + (remainingBudget >= 0 ? "UNDER BUDGET" : "OVER BUDGET") + "\n" +
      "Amount over/under budget: Rs " + Math.abs(remainingBudget) + "\n" +
      "Number of members: " + group.members.length + "\n" +
      "Members: " + group.members.map((m) => m.name).join(", ") + "\n\n" +
      "CATEGORY BREAKDOWN\n" +
      Object.keys(categoryBreakdown).map((cat) => "- " + cat + ": Rs " + categoryBreakdown[cat]).join("\n") + "\n" +
      "Largest category: " + topCategory + " (Rs " + topCategoryAmount + ")\n\n" +
      "AMOUNT PAID BY EACH PERSON\n" +
      Object.keys(paidTotals).map((name) => "- " + name + ": Rs " + paidTotals[name]).join("\n") + "\n\n" +
      "CURRENT BALANCES\n" +
      (balanceLines.length > 0 ? balanceLines.join("\n") : "Everyone is settled up.") + "\n\n" +
      "ALL EXPENSES\n" +
      (expenseLines.length > 0 ? expenseLines.join("\n") : "No expenses yet.");

    // SMART RULE-BASED FALLBACK GENERATOR (Guarantees zero downtime / zero failure)
    const generateFallbackAnswer = (userQ) => {
      const q = userQ.toLowerCase();
      if (q.includes("who owes") || q.includes("owes") || q.includes("settle") || q.includes("settlement")) {
        if (!balanceLines || balanceLines.length === 0) return "Everyone is currently settled up for **" + group.name + "**! 🎉";
        return "💡 **Current Settlement Balances:**\n\n" + balanceLines.map(b => "• " + b).join("\n");
      }
      if (q.includes("over budget") || q.includes("budget status") || q.includes("why")) {
        if (remainingBudget >= 0) {
          return `Good news! **${group.name}** is currently **UNDER BUDGET** by **Rs ${remainingBudget}** (Spent: Rs ${actualTotal} / Budget: Rs ${estimatedBudget}).`;
        }
        const overAmt = Math.abs(remainingBudget);
        return `⚠️ **Budget Breakdown:**\n\n**${group.name}** is currently **Rs ${overAmt} OVER BUDGET**.\n• **Total Spent:** Rs ${actualTotal}\n• **Estimated Budget:** Rs ${estimatedBudget}\n• **Largest Category:** ${topCategory} (Rs ${topCategoryAmount})\n\nReducing spend in ${topCategory} by Rs ${overAmt} will bring your trip back on budget!`;
      }
      if (q.includes("spending the most") || q.includes("largest") || q.includes("category") || q.includes("where")) {
        return `📊 **Largest Spending Category:**\n\n**${topCategory}** is your highest expense category at **Rs ${topCategoryAmount}**.\n\n**Category Breakdown:**\n` +
          Object.keys(categoryBreakdown).map(c => `• **${c}:** Rs ${categoryBreakdown[c]}`).join("\n");
      }
      if (q.includes("reduce") || q.includes("save") || q.includes("savings") || q.includes("how")) {
        return `💡 **Savings Recommendations for ${group.name}:**\n\n1. Your largest spending area is **${topCategory}** (Rs ${topCategoryAmount}). Focus reductions here.\n2. Consider setting category-specific caps for food & stay.\n3. Current total spent is **Rs ${actualTotal}** against an estimated budget of **Rs ${estimatedBudget}**.`;
      }
      return `📊 **Trip Financial Summary (${group.name}):**\n\n• **Total Spent:** Rs ${actualTotal}\n• **Estimated Budget:** Rs ${estimatedBudget}\n• **Status:** ${remainingBudget >= 0 ? "Under budget" : "Over budget"} (Rs ${Math.abs(remainingBudget)})\n• **Top Category:** ${topCategory} (Rs ${topCategoryAmount})`;
    };

    let answer = "";
    try {
      const prompt = `
You are Safar-E-Life AI, an intelligent financial assistant inside a group travel expense management application.
Your job is to answer the user's question using ONLY the trip data provided below. Always use Rs for currency. Give direct answers first.

============================================================
TRIP DATA
============================================================

${contextData}

============================================================
USER QUESTION
============================================================

${question.trim()}

============================================================
Now answer the user's question accurately using ONLY the provided trip data.
`;

      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const result = await model.generateContent(prompt);
      answer = result.response.text();
    } catch (aiErr) {
      console.warn("Gemini API unavailable or temporary demand spike, using Smart Financial Fallback Engine:", aiErr.message);
      answer = generateFallbackAnswer(question);
    }

    res.json({ answer });
  } catch (err) {
    console.error("AI assistant endpoint error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;
