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
      "Human_Lymph_Node_A1",
      "Human_Lymph_Node_D1",
      "Mouse_Brain_ATAC",
      "Mouse_Brain_H3K27ac",
      "Mouse_Brain_H3K27me",
      "Mouse_Brain_H3K4me",
      "Mouse_Spleen",
      "Mouse_Thymus",
    ];

    for (const name of defaultSections) {
      const exists = await DatasetSection.findOne({ name });
      if (!exists) {
        await DatasetSection.create({
          name,
          description: `Performance benchmark leaderboard for dataset: ${name.replace(/_/g, " ")}`,
        });
        console.log(`Seeded dataset section: ${name}`);
      }
    }
  } catch (error) {
    console.error(`Database connection or seeding failed: ${error.message}`);
    // DO NOT crash the process on serverless environments (Vercel) to let CORS middleware send proper responses.
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
};

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/models", modelRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.send("Leaderboard API is running");
});

module.exports = app;
