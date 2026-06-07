const mongoose = require('mongoose');

const datasetSectionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Human lymph node A1"
  description: { type: String },
  groundTruth: { type: Number }
}, { timestamps: true });

const DatasetSection = mongoose.model('DatasetSection', datasetSectionSchema);
module.exports = DatasetSection;
