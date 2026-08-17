require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("../backend/routes/authRoutes");
const groupRoutes = require("../backend/routes/groupRoutes");
const expenseRoutes = require("../backend/routes/expenseRoutes");
const receiptRoutes = require("../backend/routes/receiptRoutes");
const destinationRoutes = require("../backend/routes/destinationRoutes");

const errorHandler = require("../backend/middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://singhrajnish7970_db_user:splitsmart123@ac-dkgyga2-shard-00-00.pwhhqde.mongodb.net:27017,ac-dkgyga2-shard-00-01.pwhhqde.mongodb.net:27017,ac-dkgyga2-shard-00-02.pwhhqde.mongodb.net:27017/splitsmart?ssl=true&replicaSet=atlas-p7ruqi-shard-0&authSource=admin&appName=Cluster0";

let isConnected = false;
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    const db = await mongoose.connect(MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.get(["/api/health", "/health", "/"], (req, res) => {
  res.json({ status: "ok", message: "🌴 Safar-E-Life backend is live" });
});

app.use(["/api/auth", "/auth"], authRoutes);
app.use(["/api/groups", "/groups"], groupRoutes);
app.use(["/api/expenses", "/expenses"], expenseRoutes);
app.use(["/api/receipts", "/receipts"], receiptRoutes);
app.use(["/api/destinations", "/destinations"], destinationRoutes);

app.use(errorHandler);

module.exports = app;
