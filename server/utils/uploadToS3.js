import { PutObjectCommand } from '@aws-sdk/client-s3'
import mime from 'mime-types'
export const uploadToS3 = async (key, body, s3Client, contentType, contentLength) => {
  try {
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: mime.lookup(key) || 'application/octet-stream',
      ContentLength: contentLength,
    }

    await s3Client.send(new PutObjectCommand(uploadParams))
    console.log(`Uploaded: ${key}`)
  } catch (err) {
    console.error(`S3 upload failed for ${key}: ${err.message}`)
    throw err
  }
}
