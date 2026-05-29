const ModelSubmission = require('../models/ModelSubmission');

const getModels = async (req, res) => {
  try {
    const models = await ModelSubmission.find({}).populate('authorId', 'name').populate('datasetSectionId', 'name');
    res.json(models);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getModelById = async (req, res) => {
  try {
    const model = await ModelSubmission.findById(req.params.id)
      .populate('authorId', 'name')
      .populate('datasetSectionId', 'name');

    if (model) {
      res.json(model);
    } else {
      res.status(404).json({ message: 'Model not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createModel = async (req, res) => {
  const { 
    name, 
    datasetSectionId, 
    scoreARI, 
    scoreNMI, 
    scoreSilhouette,
    scoreAMI,
    scoreHomogeneity,
    scoreVMeasure,
    descriptionMarkdown, 
    methodologyImages, 
    architectureFlow, 
    githubUrl 
  } = req.body;

  try {
    const model = new ModelSubmission({
      name,
      authorId: req.user._id,
      datasetSectionId,
      scoreARI: scoreARI !== undefined && scoreARI !== '' ? parseFloat(scoreARI) : undefined,
      scoreNMI: scoreNMI !== undefined && scoreNMI !== '' ? parseFloat(scoreNMI) : undefined,
      scoreSilhouette: scoreSilhouette !== undefined && scoreSilhouette !== '' ? parseFloat(scoreSilhouette) : undefined,
      scoreAMI: scoreAMI !== undefined && scoreAMI !== '' ? parseFloat(scoreAMI) : undefined,
      scoreHomogeneity: scoreHomogeneity !== undefined && scoreHomogeneity !== '' ? parseFloat(scoreHomogeneity) : undefined,
      scoreVMeasure: scoreVMeasure !== undefined && scoreVMeasure !== '' ? parseFloat(scoreVMeasure) : undefined,
      descriptionMarkdown,
      methodologyImages,
      architectureFlow,
      githubUrl
    });

    const createdModel = await model.save();
    res.status(201).json(createdModel);
  } catch (error) {
    if (error.name === 'ValidationError' || error.message.includes('Validation failed')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const deleteModel = async (req, res) => {
  try {
    const model = await ModelSubmission.findById(req.params.id);

    if (model) {
      // Data Ownership & Management: Only author or admin can delete
      if (model.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to delete this model' });
      }

      await ModelSubmission.deleteOne({ _id: model._id });
      res.json({ message: 'Model removed' });
    } else {
      res.status(404).json({ message: 'Model not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateModel = async (req, res) => {
  const { 
    name, 
    datasetSectionId, 
    scoreARI, 
    scoreNMI, 
    scoreSilhouette,
    scoreAMI,
    scoreHomogeneity,
    scoreVMeasure,
    descriptionMarkdown, 
    methodologyImages, 
    architectureFlow, 
    githubUrl 
  } = req.body;

  try {
    const model = await ModelSubmission.findById(req.params.id);

    if (model) {
      // Check authorization
      if (model.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to update this model' });
      }

      model.name = name || model.name;
      model.datasetSectionId = datasetSectionId || model.datasetSectionId;
      model.scoreARI = scoreARI !== undefined ? (scoreARI !== '' ? parseFloat(scoreARI) : undefined) : model.scoreARI;
      model.scoreNMI = scoreNMI !== undefined ? (scoreNMI !== '' ? parseFloat(scoreNMI) : undefined) : model.scoreNMI;
      model.scoreSilhouette = scoreSilhouette !== undefined ? (scoreSilhouette !== '' ? parseFloat(scoreSilhouette) : undefined) : model.scoreSilhouette;
      model.scoreAMI = scoreAMI !== undefined ? (scoreAMI !== '' ? parseFloat(scoreAMI) : undefined) : model.scoreAMI;
      model.scoreHomogeneity = scoreHomogeneity !== undefined ? (scoreHomogeneity !== '' ? parseFloat(scoreHomogeneity) : undefined) : model.scoreHomogeneity;
      model.scoreVMeasure = scoreVMeasure !== undefined ? (scoreVMeasure !== '' ? parseFloat(scoreVMeasure) : undefined) : model.scoreVMeasure;
      model.descriptionMarkdown = descriptionMarkdown !== undefined ? descriptionMarkdown : model.descriptionMarkdown;
      model.methodologyImages = methodologyImages || model.methodologyImages;
      model.architectureFlow = architectureFlow !== undefined ? architectureFlow : model.architectureFlow;
      model.githubUrl = githubUrl !== undefined ? githubUrl : model.githubUrl;

      const updatedModel = await model.save();
      
      const populatedModel = await ModelSubmission.findById(updatedModel._id)
        .populate('authorId', 'name')
        .populate('datasetSectionId', 'name');

      res.json(populatedModel);
    } else {
      res.status(404).json({ message: 'Model not found' });
    }
  } catch (error) {
    if (error.name === 'ValidationError' || error.message.includes('Validation failed')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getModels, getModelById, createModel, deleteModel, updateModel };
