import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../cloudinary.config.js';

// Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => {
    // Check image mime type
    if (!file.mimetype.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    return {
      folder: 'ai-assistant/users',

      // Auto detect any image format
      resource_type: 'image',

      public_id: `${file.fieldname}-${Date.now()}`,
    };
  },
});

// Multer Parser
const userImageParser = multer({
  storage,

  // File Size Validation
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },

  // File Type Validation
  fileFilter: (req, file, cb) => {
    // Accept all image formats
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

export default userImageParser;
