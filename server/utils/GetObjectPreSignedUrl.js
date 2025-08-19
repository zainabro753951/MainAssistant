import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const getObjectPresignedUrl = async (key, s3Client) => {
  const commond = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  })

  const url = await getSignedUrl(s3Client, commond)
  return url
}
