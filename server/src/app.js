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

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/leaderboard",
      {
        serverSelectionTimeoutMS: 5000, // Timeout connection attempt after 5 seconds instead of hanging
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);

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

    for (const sectionData of defaultSections) {
      const exists = await DatasetSection.findOne({ name: sectionData.name });
      if (!exists) {
        await DatasetSection.create({
          name: sectionData.name,
          description: `Performance benchmark leaderboard for dataset: ${sectionData.name.replace(/_/g, " ")}`,
          groundTruth: sectionData.groundTruth,
        });
        console.log(`Seeded dataset section: ${sectionData.name}`);
      } else if (sectionData.groundTruth !== undefined && exists.groundTruth !== sectionData.groundTruth) {
        exists.groundTruth = sectionData.groundTruth;
        await exists.save();
        console.log(`Updated dataset section ${sectionData.name} with groundTruth: ${sectionData.groundTruth}`);
      }
    }

    // Auto-seed default Admin user if none exists
    const User = require("./models/User");
    const bcrypt = require("bcrypt");
    const adminExists = await User.findOne({ role: "admin" });
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
  } catch (error) {
    console.error(`Database connection or seeding failed: ${error.message}`);
    // DO NOT crash the process on serverless environments (Vercel) to let CORS middleware send proper responses.
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

// Middleware to ensure database is connected before executing any queries (prevents Serverless cold start race conditions)
const ensureDbConnected = async (req, res, next) => {
  // 1 = connected
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // 2 = connecting, wait for it
  if (mongoose.connection.readyState === 2) {
    console.log("Database connection in progress, waiting for connected state...");
    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timeout waiting for database connection to establish"));
        }, 5000);

        const onConnected = () => {
          clearTimeout(timeout);
          cleanup();
          resolve();
        };

        const onError = (err) => {
          clearTimeout(timeout);
          cleanup();
          reject(err);
        };

        const cleanup = () => {
          mongoose.connection.off('connected', onConnected);
          mongoose.connection.off('error', onError);
        };

        mongoose.connection.once('connected', onConnected);
        mongoose.connection.once('error', onError);
      });
      return next();
    } catch (error) {
      return res.status(500).json({ 
        message: "Database connection in progress but failed", 
        error: error.message 
      });
    }
  }

  // 0 = disconnected, 3 = disconnecting. Try to connect.
  console.log("Database disconnected. Initiating database connection...");
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/leaderboard",
      {
        serverSelectionTimeoutMS: 5000,
      }
    );
    return next();
  } catch (error) {
    return res.status(500).json({ 
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
