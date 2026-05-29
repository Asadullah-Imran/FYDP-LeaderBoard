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
  scoreARI: { type: Number },
  scoreNMI: { type: Number },
  scoreSilhouette: { type: Number },
  scoreAMI: { type: Number },
  scoreHomogeneity: { type: Number },
  scoreVMeasure: { type: Number },
  
  clusterSize: { type: Number, required: true },
  
  // Parsed Artifacts & Uploads
  descriptionMarkdown: { type: String, required: true }, // Markdown + LaTeX content
  methodologyImages: [{ type: String }], // Array of image URLs for methodology
  architectureFlow: { type: String }, // Optional Mermaid.js syntax content
  githubUrl: { type: String }, // Optional link to source code / github repository
  
}, { timestamps: true });

modelSubmissionSchema.pre('validate', function(next) {
  // Clear out any nulls or empty strings
  if (this.scoreARI === null || this.scoreARI === '') this.scoreARI = undefined;
  if (this.scoreNMI === null || this.scoreNMI === '') this.scoreNMI = undefined;
  if (this.scoreSilhouette === null || this.scoreSilhouette === '') this.scoreSilhouette = undefined;
  if (this.scoreAMI === null || this.scoreAMI === '') this.scoreAMI = undefined;
  if (this.scoreHomogeneity === null || this.scoreHomogeneity === '') this.scoreHomogeneity = undefined;
  if (this.scoreVMeasure === null || this.scoreVMeasure === '') this.scoreVMeasure = undefined;

  let count = 0;
  if (typeof this.scoreARI === 'number' && !isNaN(this.scoreARI)) count++;
  if (typeof this.scoreNMI === 'number' && !isNaN(this.scoreNMI)) count++;
  if (typeof this.scoreSilhouette === 'number' && !isNaN(this.scoreSilhouette)) count++;

  if (count < 2) {
    next(new Error('Validation failed: You must provide at least two of the primary metrics (ARI, NMI, Silhouette).'));
  } else {
    next();
  }
});

const ModelSubmission = mongoose.model('ModelSubmission', modelSubmissionSchema);
module.exports = ModelSubmission;

