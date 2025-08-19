import path from 'path'

export function normalizeToForwardSlash(filePath) {
  // Normalize OS-specific path first
  let normalized = path.normalize(filePath)
  // Replace all backslashes with forward slashes
  return normalized.replace(/\\/g, '/')
}
