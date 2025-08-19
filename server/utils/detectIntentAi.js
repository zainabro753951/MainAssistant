// utils/aiIntentDetector.js
import openai from '../openai.config.js'

export const detectIntentAI = async userMessage => {
  const intentPrompt = `
Classify the user's intent based on this message:
"${userMessage}"

Return only one of these categories:
- code
- step_by_step
- emotional
- fun
- general
`

  const result = await openai.chat.completions.create({
    model: process.env.TEXT_GEN_AI_MODEL,
    messages: [{ role: 'user', content: intentPrompt }],
  })

  const rawIntent = result.choices[0]?.message?.content?.toLowerCase()?.trim()
  const validIntents = ['code', 'step_by_step', 'emotional', 'fun', 'general']

  return validIntents.includes(rawIntent) ? rawIntent : 'general'
}
