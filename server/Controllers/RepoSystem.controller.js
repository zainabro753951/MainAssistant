import pool from '../db.config.js'
import { uploadToS3 } from '../utils/uploadToS3.js'
import s3Client from '../aws_s3.config.js'
import { DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { GoogleGenAI } from '@google/genai'
import { Transform } from 'stream'
import { normalizeToForwardSlash } from '../utils/normalizeToForwardSlash.js'

export const createRepo = async (req, res) => {
  try {
    const { repoName } = req.body
    const userId = req.user.id

    const [rows] = await pool.query('SELECT * FROM repos WHERE repo_name = ?', [repoName])

    if (rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, errorCode: 'REPO_FOUND', message: 'Repository already exists' })
    }

    const [result] = await pool.query('INSERT INTO repos (user_id, repo_name) VALUES (?, ?)', [
      userId,
      repoName,
    ])

    res.json({
      success: true,
      message: 'Repository created successfully',
      repoId: result?.insertId,
      userId,
      repoName,
    })
  } catch (error) {
    console.log('Error during creating repos : ' + error)

    res
      .status(500)
      .json({ success: false, errorCode: 'SERVER_ERROR', message: 'Internal Server Error' })
  }
}

export const getAllRepos = async (req, res) => {
  try {
    const { id } = req.user
    const [repos] = await pool.query('SELECT * FROM repos where user_id = ?', [id])
    res.status(200).json({
      success: true,
      repos,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: 'Intenal Server Error',
    })
  }
}

export const addRepo = async (req, res) => {
  try {
    const { repoId } = req.params
    const { paths } = req.body
    const { files, user } = req

    if (!repoId || isNaN(Number(repoId))) {
      return res.status(400).json({ success: false, message: 'Invalid repoId' })
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' })
    }

    if (!paths || !Array.isArray(paths) || paths.length !== files.length) {
      return res.status(400).json({ success: false, message: 'Invalid file paths provided' })
    }

    const [rows] = await pool.query('SELECT * FROM repos WHERE id = ?', [repoId])
    const repo = rows[0]
    if (!repo) {
      return res.status(404).json({ success: false, message: 'Repo not found' })
    }

    const uploadResults = await Promise.allSettled(
      files.map((file, idx) => {
        const relativePath = normalizeToForwardSlash(paths[idx]) // ✅ fix here
        const safePath = relativePath.replace(/^(\.\.(\/|\\|$))+/, '') // prevent path traversal

        const s3Key = `${user.firstName}${user.lastName}-${repo.user_id}/${repo.repo_name}/${safePath}`

        console.log(`📤 Uploading: ${s3Key}`)

        return uploadToS3(s3Key, file.buffer, s3Client, file.mimetype, file.size)
      })
    )

    const failed = uploadResults.filter(r => r.status === 'rejected')
    if (failed.length > 0) {
      console.error(
        '❌ Failed uploads:',
        failed.map(f => f.reason)
      )
      return res.status(500).json({
        success: false,
        message: 'Some files failed to upload',
        failed: failed.map(f => f.reason.message || f.reason),
      })
    }

    return res.json({
      success: true,
      message: 'All files uploaded to S3 successfully',
    })
  } catch (error) {
    console.error('🚨 Error during addRepo:', error)
    return res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: error.message || 'Internal Server Error',
    })
  }
}

export const fetchRepos = async (req, res) => {
  try {
    // Capture prefix from params
    let prefix = req.params.prefix || ''

    // If it's an array (multiple segments), join them with "/"
    if (Array.isArray(prefix)) {
      prefix = prefix.join('/')
    }

    if (prefix && !prefix.endsWith('/')) {
      prefix += '/'
    }

    const { Contents, CommonPrefixes } = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET_NAME,
        Prefix: prefix,
        Delimiter: '/',
      })
    )

    // Folders
    const folders = (CommonPrefixes || []).map(f => ({
      name: f.Prefix.replace(prefix, '').replace(/\/$/, ''),
      key: f.Prefix,
      type: 'folder',
    }))

    // Files
    const files = (Contents || [])
      .filter(c => c.Key !== prefix) // remove self folder reference
      .map(f => ({
        name: f.Key.replace(prefix, ''),
        key: f.Key,
        type: 'file',
        size: f.Size,
      }))

    // Merge with folders first, files after
    const items = [...folders, ...files]

    res.json({ success: true, items })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Failed to list files' })
  }
}

export const fetchFileContent = async (req, res) => {
  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    // Get the file key from request params
    const prefix = Array.isArray(req.params.prefix)
      ? req.params.prefix.join('/')
      : req.params.prefix || ''

    // Fetch file from S3
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: prefix,
    })
    const s3Response = await s3Client.send(command)

    // Read the file content
    let fileContent = ''
    for await (const chunk of s3Response.Body) {
      fileContent += chunk.toString('utf-8')
    }
    console.log(fileContent)

    // Prepare AI prompt
    const prompt = `You are a senior code reviewer analyzing users code. Provide specific, actionable suggestions in this exact JSON format:

[{
  "lineNumber": <number>,
  "suggestion": "<improved_code_snippet>",
  "comment": "<technical_justification>",
  "severity": "<low|medium|high>",
  "category": "<performance|security|readability|best_practice>"
}]

Focus on:
1. Security vulnerabilities
2. Performance optimizations
3. Modern JavaScript/Node.js best practices
4. Code organization improvements
5. Error handling enhancements

Code to review:
\`\`\`javascript
${fileContent}
\`\`\`

Important rules:
- Suggest complete code replacements, not partial edits
- Include imports if suggesting new dependencies
- Prioritize native Node.js APIs over third-party libs
- Mark security issues as high severity
- Keep suggestions concise but technically precise`

    // Get AI suggestions
    let aiSuggestions = []
    try {
      const aiResponse = await genAI.models.generateContent({
        model: process.env.GEMINI_MODEL,
        contents: prompt,
      })
      aiSuggestions = aiResponse?.candidates[0]?.content?.parts[0]?.text // assuming it returns JSON directly
    } catch (e) {
      console.error('AI suggestion failed', e)
      aiSuggestions = [{ error: 'AI suggestion failed' }]
    }

    // Send final response
    res.json({
      success: true,
      fileName: prefix.split('/').pop(),
      model: process.env.GEMINI_MODEL,
      fileContent,
      aiSuggestions,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: err.message })
  }
}

export const deleteRepo = async (req, res) => {
  try {
    const { id, firstName, lastName } = req.user
    const { repoId, repoName } = req.params

    // Direct delete attempt
    const [result] = await pool.query(
      'DELETE FROM repos WHERE user_id = ? AND id = ? AND repo_name = ?',
      [id, repoId, repoName]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        errorCode: 'REPO_NOT_FOUND',
        message: 'Repository not found!',
      })
    }
    // 2️⃣ S3 se delete
    const bucketName = process.env.AWS_BUCKET_NAME
    const prefix = `${firstName}${lastName}-${id}/${repoName}/` // maan lo tum is tarah save karte ho

    // list objects under prefix
    const listedObjects = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      })
    )

    if (listedObjects.Contents && listedObjects.Contents.length > 0) {
      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: listedObjects.Contents.map(item => ({ Key: item.Key })),
        },
      }

      await s3Client.send(new DeleteObjectsCommand(deleteParams))
    }

    res.status(200).json({
      success: true,
      message: 'Repository deleted successfully!',
    })
  } catch (error) {
    console.error(`Error during deleting repo: ${error}`)
    res.status(500).json({
      success: false,
      errorCode: 'SERVER_ERROR',
      message: 'Internal Server Error',
    })
  }
}
