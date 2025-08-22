import { validationResult } from 'express-validator'
import { getAIPrompt } from '../utils/promtOfAi.js'
import { executeSystemCommand } from '../utils/commondExecuter.js'
import { GoogleGenAI } from '@google/genai'

export const textGen = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      errors: errors.array(),
    })
  }

  const { prompt } = req.body
  const { AIAssistantName, firstName, lastName } = req?.user

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })

    // Build prompt
    const finalPrompt = getAIPrompt(prompt, AIAssistantName, `${firstName} ${lastName}`)

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL,
      contents: finalPrompt,
    })

    const aiResponse = response?.candidates[0]?.content?.parts[0]?.text
    const cleaned = aiResponse
      .replace(/```json\s*/i, '') // remove opening ```json
      .replace(/```$/, '') // remove closing ```

    let parsedResponse
    try {
      parsedResponse = JSON.parse(cleaned)
    } catch (err) {
      console.error('❌ Still invalid JSON:', err.message)
    }

    await executeSystemCommand(parsedResponse?.type, parsedResponse?.userInput)

    return res.status(200).json({
      success: true,
      data: {
        user: prompt,
        ai: parsedResponse,
      },
    })
  } catch (err) {
    console.error('Text generation error:', err)

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        errorCode: 'AI_PROCESSING_ERROR',
        message: 'An error occurred while processing your request.',
      })
    }
  }
}
