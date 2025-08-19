export const detectIntent = (text = '') => {
  const lower = text.toLowerCase()

  if (lower.includes('how to') || lower.includes('steps') || lower.includes('guide')) {
    return 'step_by_step'
  }
  if (
    lower.includes('code') ||
    lower.includes('function') ||
    lower.includes('javascript') ||
    lower.includes('react')
  ) {
    return 'code'
  }
  if (lower.includes('sad') || lower.includes('feel') || lower.includes('demotivated')) {
    return 'emotional'
  }
  if (lower.includes('joke') || lower.includes('funny') || lower.includes('laugh')) {
    return 'fun'
  }

  return 'general'
}
