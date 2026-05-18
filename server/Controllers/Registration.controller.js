import axios from 'axios';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import streamifier from 'streamifier';
import cloudinary from '../cloudinary.config.js';
import pool from '../db.config.js';
import { generateTokenAndSaveCookie } from '../middlewares/generateTokenAndSaveCookie.js';

// Helper function to format validation errors into user-friendly format
const formatValidationErrors = (errors) => {
  return errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));
};

// ==================== REGISTRATION ====================

export const RegValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required.')
    .isString()
    .withMessage('First name must be valid text.')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long.'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required.')
    .isString()
    .withMessage('Last name must be valid text.')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long.'),

  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please enter a valid email address (e.g., user@example.com).'),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters long.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number.')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain at least one special character (e.g., !@#$%^&*).'),

  body('isAgree').custom((value) => {
    if (value !== true && value !== 'true') {
      throw new Error('You must agree to our Terms & Conditions and Privacy Policy to continue.');
    }
    return true;
  }),
];

export const registration = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: 'Please correct the errors in the registration form.',
        errors: formatValidationErrors(errors),
      });
    }

    const { firstName, lastName, email, password, isAgree } = req.body;

    // Check if email already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [
      email.toLowerCase(),
    ]);
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        errorCode: 'EMAIL_EXISTS',
        message:
          'This email is already registered. Please sign in or use a different email address.',
      });
    }

    // Hash password with strong salt rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (firstName, lastName, email, password, isAgree) VALUES (?, ?, ?, ?, ?)',
      [
        firstName.trim(),
        lastName.trim(),
        email.toLowerCase().trim(),
        hashedPassword,
        isAgree || true,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! You can now sign in.',
      userId: result.insertId,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      errorCode: 'REGISTRATION_FAILED',
      message: 'We were unable to create your account. Please try again later.',
    });
  }
};

// ==================== LOGIN ====================

export const LoginValidation = [
  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please enter a valid email address.'),

  body('password').notEmpty().withMessage('Password is required.'),
];

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: 'Please provide valid login credentials.',
        errors: formatValidationErrors(errors),
      });
    }

    const { email, password, rememberMe } = req.body;

    // Find user by email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        errorCode: 'USER_NOT_FOUND',
        message: 'No account found with this email address. Please sign up or check your email.',
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        errorCode: 'INVALID_PASSWORD',
        message: 'Incorrect password. Please try again or reset your password.',
      });
    }

    // Generate token and save cookie
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.created_at,
    };

    const token = generateTokenAndSaveCookie(userData, rememberMe, res);

    // Remove sensitive data before sending
    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      errorCode: 'LOGIN_FAILED',
      message: 'We were unable to log you in. Please try again later.',
    });
  }
};

// ==================== LOGOUT ====================

export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'You have been logged out successfully.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      errorCode: 'LOGOUT_FAILED',
      message: 'We were unable to log you out. Please try again.',
    });
  }
};

// ==================== PROFILE UPDATE ====================

export const profileSettingValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required.')
    .isString()
    .withMessage('First name must be valid text.')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long.'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required.')
    .isString()
    .withMessage('Last name must be valid text.')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long.'),

  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please enter a valid email address.'),

  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required.')
    .isMobilePhone('any')
    .withMessage('Please enter a valid phone number (include country code).'),

  body('bio')
    .trim()
    .notEmpty()
    .withMessage('Bio is required.')
    .isLength({ min: 10 })
    .withMessage('Bio must be at least 10 characters long.')
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters.'),
];

export const updateUserProfileInfo = async (req, res) => {
  const files = req.files || {};

  // Cleanup helper for uploaded files
  const cleanupUploads = async () => {
    try {
      if (files?.profileImage?.[0]?.filename) {
        await cloudinary.uploader.destroy(files.profileImage[0].filename);
      }
      if (files?.bannerImage?.[0]?.filename) {
        await cloudinary.uploader.destroy(files.bannerImage[0].filename);
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  };

  try {
    // Validate input
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      await cleanupUploads();
      return res.status(422).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: 'Please correct the errors in your profile form.',
        errors: formatValidationErrors(errors),
      });
    }

    const { id, firstName, lastName, email, phoneNumber, bio } = req.body;

    // Find existing user
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      await cleanupUploads();
      return res.status(404).json({
        success: false,
        errorCode: 'USER_NOT_FOUND',
        message: 'User account not found.',
      });
    }

    const user = users[0];

    // Check if new email is already taken by another user
    if (email.toLowerCase() !== user.email.toLowerCase()) {
      const [emailExists] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [
        email.toLowerCase(),
        id,
      ]);
      if (emailExists.length > 0) {
        await cleanupUploads();
        return res.status(409).json({
          success: false,
          errorCode: 'EMAIL_EXISTS',
          message: 'This email is already in use by another account.',
        });
      }
    }

    // Initialize image URLs and public IDs
    let profileImageUrl = user.profileImage || null;
    let bannerImageUrl = user.bannerImage || null;
    let profileImagePublicId = user.profileImagePublicId || null;
    let bannerImagePublicId = user.bannerImagePublicId || null;

    // Store old public IDs for cleanup after successful update
    const oldProfilePublicId = user.profileImagePublicId;
    const oldBannerPublicId = user.bannerImagePublicId;

    // Process new images if uploaded
    if (files?.profileImage?.[0]) {
      profileImageUrl = files.profileImage[0].path;
      profileImagePublicId = files.profileImage[0].filename;
    }

    if (files?.bannerImage?.[0]) {
      bannerImageUrl = files.bannerImage[0].path;
      bannerImagePublicId = files.bannerImage[0].filename;
    }

    // Update user in database
    await pool.query(
      `UPDATE users SET
        firstName = ?,
        lastName = ?,
        email = ?,
        phoneNumber = ?,
        bio = ?,
        profileImage = ?,
        bannerImage = ?,
        profileImagePublicId = ?,
        bannerImagePublicId = ?
      WHERE id = ?`,
      [
        firstName.trim(),
        lastName.trim(),
        email.toLowerCase().trim(),
        phoneNumber.trim(),
        bio.trim(),
        profileImageUrl,
        bannerImageUrl,
        profileImagePublicId,
        bannerImagePublicId,
        id,
      ]
    );

    // Clean up old images from Cloudinary AFTER successful DB update
    try {
      if (files?.profileImage?.[0] && oldProfilePublicId) {
        await cloudinary.uploader.destroy(oldProfilePublicId);
      }
      if (files?.bannerImage?.[0] && oldBannerPublicId) {
        await cloudinary.uploader.destroy(oldBannerPublicId);
      }
    } catch (cleanupError) {
      console.error('Old image cleanup failed:', cleanupError);
      // Don't fail request - log and continue
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        phoneNumber: phoneNumber.trim(),
        bio: bio.trim(),
        profileImage: profileImageUrl,
        bannerImage: bannerImageUrl,
      },
    });
  } catch (error) {
    console.log('Profile update error:', error);
    await cleanupUploads();
    return res.status(500).json({
      success: false,
      errorCode: 'UPDATE_FAILED',
      message: 'We were unable to update your profile. Please try again later.',
    });
  }
};

// ==================== AI ASSISTANT SETUP ====================

export const settingAIAssistant = async (req, res) => {
  try {
    const { assistantName, AIAssistantImage } = req.body;
    const userId = req.user?.id;

    // Validate authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        errorCode: 'UNAUTHORIZED',
        message: 'You must be logged in to perform this action.',
      });
    }

    // Validate required fields
    if (!assistantName || !assistantName.trim()) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_INPUT',
        message: 'Assistant name is required.',
      });
    }

    if (!AIAssistantImage) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_INPUT',
        message: 'Assistant image is required.',
      });
    }

    // Build full image URL
    const imageUrl = AIAssistantImage.startsWith('http')
      ? AIAssistantImage
      : `${process.env.FRONTEND_URLS}/${AIAssistantImage}`;

    // Fetch image buffer
    let response;
    try {
      response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });
    } catch (fetchError) {
      console.error('Image fetch error:', fetchError.message);
      return res.status(400).json({
        success: false,
        errorCode: 'IMAGE_FETCH_FAILED',
        message: 'Unable to load the assistant image. Please try uploading again.',
      });
    }

    const buffer = Buffer.from(response.data, 'binary');

    // Upload to Cloudinary
    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'ai-assistant/profileImage',
            transformation: [{ width: 300, height: 300, crop: 'limit' }],
            resource_type: 'image',
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });

    let uploadedImage;
    try {
      uploadedImage = await streamUpload();
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError.message);
      return res.status(500).json({
        success: false,
        errorCode: 'IMAGE_UPLOAD_FAILED',
        message: 'Failed to upload assistant image. Please try again.',
      });
    }

    // Update database
    await pool.query(
      'UPDATE users SET isAISet = ?, AIProfileImage = ?, AIAssistantName = ? WHERE id = ?',
      [true, uploadedImage.secure_url, assistantName.trim(), userId]
    );

    // Fetch updated user data
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        errorCode: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    const { password, ...safeUser } = users[0];

    return res.status(200).json({
      success: true,
      message: 'AI assistant setup completed successfully.',
      user: safeUser,
    });
  } catch (error) {
    console.error('AI assistant setup error:', error.message);
    return res.status(500).json({
      success: false,
      errorCode: 'AI_SETUP_FAILED',
      message: 'We were unable to set up your AI assistant. Please try again later.',
    });
  }
};

// ==================== AUTH CHECK ====================

export const auth = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        errorCode: 'UNAUTHORIZED',
        message: 'You are not authenticated. Please log in to continue.',
      });
    }

    // Remove sensitive fields
    const { password, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Authentication verified.',
      user: safeUser,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({
      success: false,
      errorCode: 'AUTH_CHECK_FAILED',
      message: 'Unable to verify authentication status. Please try again.',
    });
  }
};
