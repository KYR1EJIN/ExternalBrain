import OpenAI from 'openai'
import { getOpenAIApiKey, validateEnv } from '@/lib/config/env'

let openaiInstance: OpenAI | null = null

/**
 * Gets or creates the OpenAI client instance
 * Validates environment variables before creating
 */
export function getOpenAIClient(): OpenAI {
  if (openaiInstance) {
    return openaiInstance
  }

  // Validate environment variables
  validateEnv()

  const apiKey = getOpenAIApiKey()
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  openaiInstance = new OpenAI({
    apiKey,
  })

  return openaiInstance
}
