import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../cloudinary.config.js'

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ai-assistant/users',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      return file.fieldname + '-' + uniqueSuffix
    },
  },
})

const userImageParser = multer({ storage })

export default userImageParser
