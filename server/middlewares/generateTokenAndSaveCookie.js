import jwt from 'jsonwebtoken'

export const generateTokenAndSaveCookie = (data, rememberMe = '30d', res) => {
  const jwtSecret = process.env.SECRET
  console.log(rememberMe)

  const token = jwt.sign(data, jwtSecret, {
    expiresIn: rememberMe ? '30d' : '1h',
  })

  res.cookie('token', token, {
    httpOnly: true, // Prevent JS access
    secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000, // 30d or 1h in ms
    sameSite: 'strict',
  })

  return token
}
