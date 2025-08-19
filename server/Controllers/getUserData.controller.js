import pool from '../db.config.js'

export const getUser = async (req, res) => {
  try {
    const { id } = req.body
    const [rows] = await pool.query(
      'SELECT id, firstName, lastName, email, phoneNumber, isAgree, bio, bannerImage, profileImage, created_at FROM users WHERE id = ?',
      [id]
    )

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, errorCode: 'USER_NOT_FOUND', message: 'User data is lost!' })
    }

    res.status(200).json({ success: true, user: rows[0] })
  } catch (error) {
    res
      .status(500)
      .json({ success: false, erroCode: 'SERVER_ERROR', message: 'Internal Server Error!' })
  }
}
