const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers, updateUser, deleteUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Admin-only user directory management
router.route('/users')
  .get(protect, admin, getUsers);

router.route('/users/:id')
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
