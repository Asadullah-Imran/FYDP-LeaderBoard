const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

// Disable buffering commands in Mongoose for fast failure in serverless environments (Vercel)
mongoose.set('bufferCommands', false);

const authRoutes = require("./routes/authRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const modelRoutes = require("./routes/modelRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

const allowedOrigins = (
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  "https://fydp-leader-board.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  }),
);
app.use(express.json());

// Global caching variables for Serverless environment
let cachedDb = null;
let isSeedingCompleted = false;

// Seed logic helper
const seedDatabase = async () => {
  console.log("Checking database seeds...");
  
  const DatasetSection = require("./models/DatasetSection");
  const defaultSections = [
    { name: "Human_Lymph_Node_A1", groundTruth: 10 },
    { name: "Human_Lymph_Node_D1", groundTruth: 11 },
    { name: "Mouse_Brain_ATAC" },
    { name: "Mouse_Brain_H3K27ac" },
    { name: "Mouse_Brain_H3K27me" },
    { name: "Mouse_Brain_H3K4me" },
    { name: "Mouse_Spleen" },
    { name: "Mouse_Thymus" },
  ];

  // Optimize: Fetch all existing sections in one single query
  const sectionNames = defaultSections.map(s => s.name);
  const existingSections = await DatasetSection.find({ name: { $in: sectionNames } });
  const existingMap = new Map(existingSections.map(s => [s.name, s]));

  const bulkOps = [];
  for (const sectionData of defaultSections) {
    const exists = existingMap.get(sectionData.name);
    if (!exists) {
      bulkOps.push({
        insertOne: {
          document: {
            name: sectionData.name,
            description: `Performance benchmark leaderboard for dataset: ${sectionData.name.replace(/_/g, " ")}`,
            groundTruth: sectionData.groundTruth,
          }
        }
      });
      console.log(`Prepared seed for dataset section: ${sectionData.name}`);
    } else if (sectionData.groundTruth !== undefined && exists.groundTruth !== sectionData.groundTruth) {
      bulkOps.push({
        updateOne: {
          filter: { name: sectionData.name },
          update: { $set: { groundTruth: sectionData.groundTruth } }
        }
      });
      console.log(`Prepared groundTruth update for dataset section: ${sectionData.name}`);
    }
  }

  if (bulkOps.length > 0) {
    await DatasetSection.bulkWrite(bulkOps);
    console.log(`Seeded/Updated dataset sections using bulkWrite (${bulkOps.length} ops)`);
  }

  // Auto-seed default Admin user if none exists
  const User = require("./models/User");
  const bcrypt = require("bcrypt");
  const adminExists = await User.findOne({ role: "admin" }).select("_id");
  if (!adminExists) {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin";
    const adminName = "System Admin";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await User.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });
    console.log(`Seeded admin account: ${adminEmail}`);
  }
};

const connectDB = async () => {
  // If we already have a connection, return it
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection promise is not already cached, or state is disconnected, create it
  if (!cachedDb || mongoose.connection.readyState === 0) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
    };
    
    console.log("Initiating new MongoDB connection...");
    cachedDb = mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/leaderboard",
      opts
    ).then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }).catch((err) => {
      cachedDb = null; // Reset cache on failure so we can retry
      console.error(`Database connection failed: ${err.message}`);
      throw err;
    });
  }

  await cachedDb;
  
  // Run seeding if it hasn't been completed yet
  if (!isSeedingCompleted) {
    try {
      await seedDatabase();
      isSeedingCompleted = true;
    } catch (err) {
      console.error(`Database seeding failed: ${err.message}`);
    }
  }

  return mongoose.connection;
};

// Middleware to ensure database is connected before executing any queries (prevents Serverless cold start race conditions)
const ensureDbConnected = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ 
      message: "Database connection failed", 
      error: error.message 
    });
  }
};

connectDB();

app.use(ensureDbConnected);

app.use("/api/auth", authRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Leaderboard API is running");
});

module.exports = app;
