import pool from '../db.config.js'
import jwt from 'jsonwebtoken'

export const secureRoute = async (req, res, next) => {
  try {
    // 1️⃣ Token check: cookies ya header se
    let token = req.cookies?.token
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ')
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1]
      }
    }

    // 2️⃣ Agar token nahi mila to 401
    if (!token) {
      return res.status(401).json({
        success: false,
        errorCode: 'UNAUTHORIZE_USER',
        message: 'You are not authorized user, please register your account',
      })
    }

    // 3️⃣ Token verify
    let decode
    try {
      decode = jwt.verify(token, process.env.SECRET)
    } catch (err) {
      console.error(err)
      return res.status(403).json({
        success: false,
        errorCode: 'INVALIDATE_TOKEN',
        message: 'Token is not valid',
      })
    }

    // 4️⃣ DB me user check
    const [rows] = await pool.query(
      `SELECT id, firstName, lastName, email, phoneNumber, bio, bannerImage,
              profileImage, created_at, isAgree, isAISet, AIProfileImage, AIAssistantName
       FROM users WHERE id = ?`,
      [decode.id] // ensure array format for query params
    )

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        errorCode: 'NOT_FOUND',
        message: 'User not found!',
      })
    }

    // 5️⃣ Request me user attach karke next middleware
    req.user = rows[0]
    next()
  } catch (error) {
    console.error(error)
    return res.status(401).json({
      success: false,
      errorCode: 'UNAUTHORIZE',
      message: 'No token, authorization denied',
    })
  }
}
