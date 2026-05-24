const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const modelRoutes = require("./routes/modelRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

const allowedOrigins = (
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  ""
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
    console.error(`Error: ${error.message}`);
    process.exit(1);
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
