const express = require("express");
const Group = require("../models/Group");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE a new group
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, estimatedBudget } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const newGroup = await Group.create({
      name,
      description,
      estimatedBudget,
      createdBy: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json({
      message: "Group created successfully",
      group: newGroup,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET all groups the logged-in user belongs to
router.get("/", protect, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).populate(
      "members",
      "name email"
    );

    res.json({ groups });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET a single group by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate(
      "members",
      "name email"
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json({ group });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ADD a member to a group
router.post("/:id/members", protect, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    group.members.push(userId);
    await group.save();

    res.json({ message: "Member added successfully", group });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;