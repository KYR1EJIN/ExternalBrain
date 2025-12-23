/**
 * Environment variable configuration
 * 
 * Validates and exports environment variables with defaults
 * Environment variables are only required at runtime, not during build
 */

function getEnvVar(key: string, defaultValue?: string, required = true): string {
  const value = process.env[key] || defaultValue
  if (!value && required) {
    // Only throw in production or when explicitly validated
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${key}`)
    }
    // In development, return empty string and log warning
    console.warn(`Warning: Missing environment variable: ${key}. Set it before using OpenAI features.`)
    return ''
  }
  return value || ''
}

/**
 * Gets OpenAI API key
 * Returns empty string if not set (to avoid build errors)
 */
function _getOpenAIApiKey(): string {
  return getEnvVar('OPENAI_API_KEY', undefined, false)
}

/**
 * Gets OpenAI Vector Store ID
 * Returns empty string if not set (to avoid build errors)
 */
function _getOpenAIVectorStoreId(): string {
  return getEnvVar('OPENAI_VECTOR_STORE_ID', undefined, false)
}

/**
 * OpenAI API configuration
 * Exported as getters to avoid validation errors at module load time
 */
export function getOpenAIApiKey(): string {
  return _getOpenAIApiKey()
}

export function getOpenAIVectorStoreId(): string {
  return _getOpenAIVectorStoreId()
}

// For backward compatibility - these return empty strings if not set
// Use getOpenAIApiKey() and getOpenAIVectorStoreId() functions for validation
export const OPENAI_API_KEY = _getOpenAIApiKey()
export const OPENAI_VECTOR_STORE_ID = _getOpenAIVectorStoreId()

export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo'

/**
 * Application configuration
 */
export const DEFAULT_BOOK_ID = process.env.DEFAULT_BOOK_ID || 'default'
export const NODE_ENV = process.env.NODE_ENV || 'development'

/**
 * Validates that all required environment variables are set
 * Call this before using OpenAI features
 */
export function validateEnv(): void {
  const apiKey = getOpenAIApiKey()
  const vectorStoreId = getOpenAIVectorStoreId()
  
  if (!apiKey) {
    throw new Error('Missing required environment variable: OPENAI_API_KEY')
  }
  if (!vectorStoreId) {
    throw new Error('Missing required environment variable: OPENAI_VECTOR_STORE_ID')
  }
}
