const express = require('express');
const router = express.Router();
const { getSections, createSection, deleteSection } = require('../controllers/sectionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getSections)
  .post(protect, admin, createSection);

router.route('/:id')
  .delete(protect, admin, deleteSection);

module.exports = router;
