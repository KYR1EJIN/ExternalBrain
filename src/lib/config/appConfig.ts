/**
 * Application-level configuration
 * 
 * Centralized app settings and feature flags
 */

export interface AppConfig {
  // Chat settings
  maxMessageLength: number
  enableStreaming: boolean
  
  // Vector store settings
  defaultTopK: number
  maxContextChunks: number
  
  // Session settings
  defaultSessionConfig: {
    maxHistoryLength: number
    maxHistoryTokens: number
  }
  
  // Feature flags
  enableSourceLabeling: boolean
  enableDebugMode: boolean
}

export const appConfig: AppConfig = {
  maxMessageLength: 4000,
  enableStreaming: true,
  defaultTopK: 5,
  maxContextChunks: 8,
  defaultSessionConfig: {
    maxHistoryLength: 20,
    maxHistoryTokens: 4000,
  },
  enableSourceLabeling: true,
  enableDebugMode: process.env.NODE_ENV === 'development',
}

