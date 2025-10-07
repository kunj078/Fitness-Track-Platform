const express = require('express');
const router = express.Router();
const {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  deleteProfilePicture,
  getProfileById,
  getAllProfiles
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { validateProfile } = require('../middleware/validation');
const { upload, handleUploadError } = require('../middleware/upload');

router.use(protect);

router.get('/', getProfile);
router.post('/', upload.single('profilePicture'), handleUploadError, validateProfile, createProfile);
router.put('/', upload.single('profilePicture'), handleUploadError, validateProfile, updateProfile);
router.delete('/', deleteProfile);

// @route   DELETE /api/profile/picture
// @desc    Delete profile picture
router.delete('/picture', deleteProfilePicture);

// @route   GET /api/profile/public
// @desc    Get all public profiles
// @access  Private
router.get('/public', getAllProfiles);

// @route   GET /api/profile/:userId
// @desc    Get profile by user ID
// @access  Private
router.get('/:userId', getProfileById);

module.exports = router;
