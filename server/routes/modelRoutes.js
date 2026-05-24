const express = require('express');
const router = express.Router();
const { getModels, getModelById, createModel, deleteModel, updateModel } = require('../controllers/modelController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getModels)
  .post(protect, createModel);

router.route('/:id')
  .get(getModelById)
  .put(protect, updateModel)
  .delete(protect, deleteModel);

module.exports = router;
