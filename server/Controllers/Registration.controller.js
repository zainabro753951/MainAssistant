import { body, validationResult } from 'express-validator'
import pool from '../db.config.js'
import bcrypt from 'bcrypt'
import { generateTokenAndSaveCookie } from '../middlewares/generateTokenAndSaveCookie.js'
import cloudinary from '../cloudinary.config.js'
import axios from 'axios'
import streamifier from 'streamifier'

// Registration Code
export const RegValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('Full name is required!')
    .isLength({ min: 3 })
    .withMessage('First name must be at least 3 characters'),

  body('lastName')
    .notEmpty()
    .withMessage('Full name is required!')
    .isLength({ min: 3 })
    .withMessage('Last name must be at least 3 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address!')
    .notEmpty()
    .withMessage('Email is required!'),
  body('password')
    .notEmpty()
    .withMessage('Password is required!')
    .isStrongPassword()
    .withMessage(
      'Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol'
    ),
]

export const registration = async (req, res) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      errors: errors.array(),
    })
  }

  try {
    const { firstName, lastName, email, password, isAgree } = req.body

    // Exists Users
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length > 0) {
      return res.status(400).json({
        success: false,
        errorCode: 'EMAIL_EXISTS',
        message: 'This email is already registered.',
      })
    }
    const hashPassword = await bcrypt.hash(password, 10)
    // Registration Code
    const [result] = await pool.query(
      'INSERT INTO users (firstName, lastName, email, password, isAgree) VALUES (?,?,?,?,?)',
      [firstName, lastName, email, hashPassword, isAgree]
    )

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: result.insertId,
    })
  } catch (error) {
    console.log(`erorr during registration ${error}`)
    res.status(500).json({
      success: false,
      message: 'Internal Server Error!',
    })
  }
}

// User Login Code
export const LoginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address!')
    .notEmpty()
    .withMessage('Email is required!'),
  body('password').notEmpty().withMessage('Password is required!'),
]

export const login = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      errors: errors.array(),
    })
  }

  try {
    const { email, password, rememberMe } = req.body
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        errorCode: 'USER_NOT_EXISTS',
        message: 'This email is not registered. Please create your account!',
      })
    }

    const user = rows[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        errorCode: 'INCORRECT_PASSWORD',
        message: 'Your password is wrong!',
      })
    }
    const userData = {
      id: user?.id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      createdAt: user?.created_at,
    }
    const token = generateTokenAndSaveCookie(userData, rememberMe, res)
    res.status(200).json({ success: true, user, token: token })
  } catch (error) {
    console.log(`Error during login ${error}`)
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    })
  }
}

export const logout = async (req, res) => {
  try {
    // Assuming your cookie name is 'token' (common in JWT-based auth)
    res.clearCookie('token', {
      httpOnly: true, // Prevent JS access
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'strict',
    })

    return res.status(200).json({
      success: true,
      message: 'Logout successful.',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: 'Internal Server Error!',
    })
  }
}

export const profileSettingValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('Full name is required!')
    .isLength({ min: 3 })
    .withMessage('First name must be at least 3 characters'),

  body('lastName')
    .notEmpty()
    .withMessage('Full name is required!')
    .isLength({ min: 3 })
    .withMessage('Last name must be at least 3 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address!')
    .notEmpty()
    .withMessage('Email is required!'),

  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required!')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number!'),

  body('bio')
    .notEmpty()
    .withMessage('Bio is required!')
    .isLength({ min: 10 })
    .withMessage('Bio must be at least 10 characters long!')
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters!')
    .trim(),
]

export const updateUserProfileInfo = async (req, res) => {
  const errors = validationResult(req)
  const files = req.files || {}

  // Cleanup helper for uploaded files
  const cleanupUploads = async () => {
    if (files?.profileImage?.[0]?.filename) {
      await cloudinary.uploader.destroy(files.profileImage[0].filename)
    }
    if (files?.bannerImage?.[0]?.filename) {
      await cloudinary.uploader.destroy(files.bannerImage[0].filename)
    }
  }

  // Step 1: Validation failure
  if (!errors.isEmpty()) {
    await cleanupUploads()
    return res.status(422).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      errors: errors.array(),
    })
  }

  try {
    const { id, firstName, lastName, email, phoneNumber, bio } = req.body

    // Find existing user
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    if (rows.length === 0) {
      await cleanupUploads()
      return res.status(404).json({
        success: false,
        errorCode: 'USER_NOT_FOUND',
        message: 'User not found!',
      })
    }

    const user = rows[0]
    let profileImageUrl = user.profileImage
    let bannerImageUrl = user.bannerImage
    let profileImagePublicId = user.profileImagePublicId
    let bannerImagePublicId = user.bannerImagePublicId

    // Track old IDs for conditional deletion
    const oldProfilePublicId = user.profileImagePublicId
    const oldBannerPublicId = user.bannerImagePublicId

    // Step 2: Process new images (if any)
    if (files?.profileImage?.[0]) {
      profileImageUrl = files.profileImage[0].path
      profileImagePublicId = files.profileImage[0].filename
    }

    if (files?.bannerImage?.[0]) {
      bannerImageUrl = files.bannerImage[0].path
      bannerImagePublicId = files.bannerImage[0].filename
    }

    // Step 3: Update user
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
        firstName,
        lastName,
        email,
        phoneNumber,
        bio,
        profileImageUrl,
        bannerImageUrl,
        profileImagePublicId,
        bannerImagePublicId,
        id,
      ]
    )

    // Step 4: Delete OLD images ONLY AFTER successful update
    try {
      // Delete old profile image ONLY if replaced
      if (files?.profileImage?.[0] && oldProfilePublicId) {
        await cloudinary.uploader.destroy(oldProfilePublicId)
      }

      // Delete old banner image ONLY if replaced
      if (files?.bannerImage?.[0] && oldBannerPublicId) {
        await cloudinary.uploader.destroy(oldBannerPublicId)
      }
    } catch (cleanupError) {
      console.error('Old image cleanup failed:', cleanupError)
      // Don't fail request - log and continue
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id,
        firstName,
        lastName,
        email,
        phoneNumber,
        bio,
        profileImage: profileImageUrl,
        bannerImage: bannerImageUrl,
      },
    })
  } catch (error) {
    console.error(error)
    await cleanupUploads() // Cleanup new uploads on error
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: 'Internal Server Error!',
    })
  }
}

export const settingAIAssistant = async (req, res) => {
  try {
    const { assistantName, AIAssistantImage } = req.body
    const { id } = req.user

    if (!assistantName || !AIAssistantImage) {
      return res.status(400).json({
        success: false,
        message: 'Name and image are required',
      })
    }

    // Use full URL if not already provided
    const imageUrl = AIAssistantImage.startsWith('http')
      ? AIAssistantImage
      : `${process.env.FRONTEND_URLS}/${AIAssistantImage}`

    // Fetch image as buffer
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    })

    const buffer = Buffer.from(response.data, 'binary')

    // Upload to Cloudinary
    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'ai-assistant/profileImage',
            transformation: [{ width: 300, height: 300, crop: 'limit' }],
          },
          (error, result) => {
            if (result) resolve(result)
            else reject(error)
          }
        )
        streamifier.createReadStream(buffer).pipe(stream)
      })

    const uploadedImage = await streamUpload()

    // Update DB
    await pool.query(
      'UPDATE users SET isAISet = ?, AIProfileImage = ?, AIAssistantName = ? WHERE id = ?',
      [true, uploadedImage.secure_url, assistantName, id]
    )

    // Return updated user data
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    const user = rows[0]

    return res.status(200).json({
      success: true,
      message: 'Assistant saved successfully',
      user,
    })
  } catch (error) {
    console.error('AI assistant setup error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    })
  }
}

export const auth = async (req, res) => {
  const user = req.user
  res.status(200).json({ success: true, errorCode: 'USER_AUTH', user })
}
