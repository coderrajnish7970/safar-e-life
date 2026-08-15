const express = require("express");
const Group = require("../models/Group");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE a new group
router.post("/", protect, async (req, res) => {
  try {
    const {
      name,
      description,
      estimatedBudget,
      startDate,
      endDate,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Group name is required",
      });
    }

    // Dates are optional so existing groups without dates
    // continue to work.
    let parsedStartDate = null;
    let parsedEndDate = null;

    if (startDate) {
      parsedStartDate = new Date(startDate);

      if (Number.isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          message: "Invalid start date",
        });
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate);

      if (Number.isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          message: "Invalid end date",
        });
      }
    }

    // Make sure the end date is not before the start date
    if (
      parsedStartDate &&
      parsedEndDate &&
      parsedEndDate < parsedStartDate
    ) {
      return res.status(400).json({
        message: "End date cannot be before start date",
      });
    }

    const newGroup = await Group.create({
      name,
      description,
      estimatedBudget,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      createdBy: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json({
      message: "Group created successfully",
      group: newGroup,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// GET all groups the logged-in user belongs to
router.get("/", protect, async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user.id,
    }).populate("members", "name email");

    res.json({ groups });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// GET dashboard summary for all user's groups in a single call
router.get("/dashboard-summary", protect, async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user.id,
    }).populate("members", "name email");

    const Expense = require("../models/Expense");
    const Settlement = require("../models/Settlement");
    const groupIds = groups.map((g) => g._id);

    const expenses = await Expense.find({ group: { $in: groupIds } });
    const settlements = await Settlement.find({ group: { $in: groupIds } });

    const groupSummaries = {};
    let pendingReceivable = 0;

    groups.forEach((g) => {
      const gExpenses = expenses.filter(
        (e) => e.group.toString() === g._id.toString()
      );
      const gSettlements = settlements.filter(
        (s) => s.group.toString() === g._id.toString()
      );

      const actualTotal = gExpenses.reduce((sum, e) => sum + e.amount, 0);

      const categoryBreakdown = {};
      const balances = {};

      gExpenses.forEach((e) => {
        categoryBreakdown[e.category] =
          (categoryBreakdown[e.category] || 0) + e.amount;

        const paidById = e.paidBy.toString();
        balances[paidById] = (balances[paidById] || 0) + e.amount;

        e.splitBetween.forEach((split) => {
          const uId = split.user.toString();
          balances[uId] = (balances[uId] || 0) - split.share;
        });
      });

      gSettlements.forEach((s) => {
        const fromId = s.fromUser.toString();
        const toId = s.toUser.toString();
        balances[fromId] = (balances[fromId] || 0) + s.amount;
        balances[toId] = (balances[toId] || 0) - s.amount;
      });

      const estimatedBudget = g.estimatedBudget || 0;
      const difference = estimatedBudget - actualTotal;

      groupSummaries[g._id] = {
        estimatedBudget,
        actualTotal,
        difference,
        status: difference >= 0 ? "under budget" : "over budget",
        categoryBreakdown,
      };

      const myBalance = balances[req.user.id] || 0;
      pendingReceivable += myBalance;
    });

    res.json({
      groups,
      groupSummaries,
      pendingReceivable,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// GET a single group by ID
// Only group members can access the group
router.get("/:id", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate(
      "members",
      "name email"
    );

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    // Authorization check:
    // Make sure the logged-in user belongs to this group.
    const isMember = group.members.some(
      (member) => member._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this group",
      });
    }

    res.json({ group });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});
// ADD a member to a group
router.post("/:id/members", protect, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    const group = await Group.findById(req.params.id);

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
        message: "You must be a member of this group to add new members",
      });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({
        message: "User is already a member",
      });
    }

    group.members.push(userId);
    await group.save();

    res.json({
      message: "Member added successfully",
      group,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// DELETE a group (only the creator can delete)
router.delete("/:id", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the creator can delete this group",
      });
    }

    const Expense = require("../models/Expense");

    await Expense.deleteMany({
      group: req.params.id,
    });

    await Group.findByIdAndDelete(req.params.id);

    res.json({
      message: "Group and its expenses deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// REMOVE a member from a group
// Only the creator can remove members
// Cannot remove the creator through this route
router.delete("/:id/members/:userId", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only the creator can remove members",
      });
    }

    if (req.params.userId === group.createdBy.toString()) {
      return res.status(400).json({
        message: "Cannot remove the group creator",
      });
    }

    group.members = group.members.filter(
      (memberId) =>
        memberId.toString() !== req.params.userId
    );

    await group.save();

    res.json({
      message: "Member removed successfully",
      group,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;