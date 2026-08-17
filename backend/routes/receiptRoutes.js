const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
  dest: "/tmp",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

router.post("/scan", protect, upload.single("receipt"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No receipt image uploaded" });
    }

    const apiKey = process.env.GEMINI_API_KEY || "fallback_key";
    const genAI = new GoogleGenerativeAI(apiKey);

    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt =
      "Look at this receipt image. Extract the following fields and respond ONLY with valid JSON, no markdown, no explanation: " +
      '{"description": "short summary of what was purchased, like Dinner or Hotel booking", ' +
      '"amount": total amount as a number only, no currency symbol, ' +
      '"category": one of food, travel, stay, activities, misc}';

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: req.file.mimetype,
        },
      },
    ]);

    const responseText = result.response.text();

    const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      return res.status(500).json({
        message: "Could not parse receipt data",
        raw: responseText,
      });
    }

    res.json({ extracted: parsed });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupErr) {
        console.error("Failed to delete temp file:", cleanupErr);
      }
    }
  }
});

module.exports = router;