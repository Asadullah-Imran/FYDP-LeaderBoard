const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables immediately
dotenv.config();

// Route imports
const authRoutes = require('./routes/authRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const modelRoutes = require('./routes/modelRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/leaderboard');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default sections if they do not exist
    const DatasetSection = require('./models/DatasetSection');
    const defaultSections = [
      'Human_Lymph_Node_A1',
      'Human_Lymph_Node_D1',
      'Mouse_Brain_ATAC',
      'Mouse_Brain_H3K27ac',
      'Mouse_Brain_H3K27me',
      'Mouse_Brain_H3K4me',
      'Mouse_Spleen',
      'Mouse_Thymus'
    ];

    for (const name of defaultSections) {
      const exists = await DatasetSection.findOne({ name });
      if (!exists) {
        await DatasetSection.create({ 
          name, 
          description: `Performance benchmark leaderboard for dataset: ${name.replace(/_/g, ' ')}` 
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

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('Leaderboard API is running');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
