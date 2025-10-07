const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordUpdate,
  validateProfileUpdate
} = require('../middleware/validation');

router.post('/signup', validateUserRegistration, signup);
router.post('/login', validateUserLogin, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, validateProfileUpdate, updateProfile);
router.put('/change-password', protect, validatePasswordUpdate, changePassword);
router.post('/logout', protect, logout);

module.exports = router;
