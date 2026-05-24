const mongoose = require('mongoose');

const modelSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "SpatialGlue", "spaLLM"
  
  authorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  datasetSectionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DatasetSection', 
    required: true 
  },
  
  // Performance Metrics
  scoreARI: { type: Number, required: true },
  scoreNMI: { type: Number, required: true },
  
  // Parsed Artifacts & Uploads
  descriptionMarkdown: { type: String, required: true }, // Markdown + LaTeX content
  methodologyImages: [{ type: String }], // Array of image URLs for methodology
  architectureFlow: { type: String }, // Optional Mermaid.js syntax content
  
}, { timestamps: true });

const ModelSubmission = mongoose.model('ModelSubmission', modelSubmissionSchema);
module.exports = ModelSubmission;
