const express = require("express");

const app = express();

app.use(express.json());

app.get("*", (req, res) => {
  res.json({ status: "ok", message: "🌴 Safar-E-Life backend is live on Vercel" });
});

module.exports = app;
