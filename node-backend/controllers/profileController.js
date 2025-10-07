const Profile = require('../models/Profile');
const { cloudinary } = require('../config/cloudinary');

// extract public_id from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
    const urlParts = url.split('/');
    console.log('Cloudinary URL parts:', urlParts); // in array
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      throw new Error('Invalid Cloudinary URL format');
    }
    
    // Get the path after 'upload' and before the last part (foldername/filename.extention)
    const pathParts = urlParts.slice(uploadIndex + 2); 
    console.log('Cloudinary Path parts:', pathParts); 

    const publicId = pathParts.join('/').split('.')[0]; // Remove file extension (foldername/filename)
    console.log('Extracted public_id:', publicId);
    
    return publicId;
  } catch (error) {
    console.log('Error extracting public_id from URL:', error.message);
    return null;
  }
};

// apis for Profile
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('user', 'name email role'); 

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please create your profile first.'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const createProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const existingProfile = await Profile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profile already exists. Use PUT to update your profile.'
      });
    }

    const profileData = {
      user: userId,
      ...req.body
    };

    // profile picture
    if (req.file) {
      profileData.profilePicture = {
        url: req.file.path
      };
    }

    const profile = await Profile.create(profileData);
    await profile.populate('user', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: profile
    });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = { ...req.body };

    // Profile picture
    if (req.file) {
      const existingProfile = await Profile.findOne({ user: userId });
      if (existingProfile && existingProfile.profilePicture && existingProfile.profilePicture.url) {
        try {
          // Find public_id from URL
          const publicId = extractPublicIdFromUrl(existingProfile.profilePicture.url);
          if (publicId) {
            console.log('Deleting old image with public_id:', publicId);
            const result = await cloudinary.uploader.destroy(publicId);
            console.log('Cloudinary deletion result:', result);
          } else {
            console.log('Could not extract public_id from URL');
          }
        } catch (error) {
          console.log('Error deleting old profile picture:', error.message);
        }
      }

      updateData.profilePicture = {
        url: req.file.path
      };
    }

    updateData.lastUpdated = new Date();

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email role');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please create your profile first.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('User ID for deleting profile picture:', userId);
    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (!profile.profilePicture || !profile.profilePicture.url) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture to delete'
      });
    }

    try {
      // Find public_id from URL
      const publicId = extractPublicIdFromUrl(profile.profilePicture.url);
      if (publicId) {
        console.log('Deleting image with public_id:', publicId);
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('Cloudinary deletion result:', result);
      } else {
        console.log('Could not extract public_id from URL');
      }
    } catch (error) {
      console.log('Error deleting profile picture from Cloudinary:', error.message);
    }

    // Remove from Mongo
    profile.profilePicture = undefined;
    profile.lastUpdated = new Date();
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully',
      data: profile
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting profile picture',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const profile = await Profile.findOne({ user: userId })
      .populate('user', 'name email role');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // check Profile is Public/private
    if (!profile.isPublic && userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getAllProfiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const fitnessGoal = req.query.fitnessGoal;
    const search = req.query.search;

    let query = { isPublic: true };
    
    if (fitnessGoal) {
      query.fitnessGoal = fitnessGoal;
    }
    
    if (search) {
      query.$or = [
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const profiles = await Profile.find(query)
      .populate('user', 'name email role')
      .select({
        'profilePicture.url': 1,
        bio: 1,
        fitnessGoal: 1,
        height: 1,
        weight: 1,
      })
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Profile.countDocuments(query);

    res.status(200).json({
      success: true,
      count: profiles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: profiles
    });
  } catch (error) {
    console.error('Get all profiles error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profiles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (profile.profilePicture && profile.profilePicture.url) {
      try {
        const publicId = extractPublicIdFromUrl(profile.profilePicture.url);
        if (publicId) {
          console.log('Deleting profile image with public_id:', publicId);
          const result = await cloudinary.uploader.destroy(publicId);
          console.log('Cloudinary deletion result:', result);
        } else {
          console.log('Could not extract public_id from URL');
        }
      } catch (error) {
        console.log('Error deleting profile picture from Cloudinary:', error.message);
      }
    }

    await Profile.findOneAndDelete({ user: userId });

    res.status(200).json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfilePicture,
  getProfileById,
  getAllProfiles,
  deleteProfile
};
