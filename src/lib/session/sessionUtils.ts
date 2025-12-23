import type { Message } from '@/types/chat'
import type { SessionConfig } from './sessionTypes'
import { DEFAULT_SESSION_CONFIG } from './sessionTypes'

/**
 * Utility functions for session management
 */

/**
 * Generates a new session ID
 */
export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Truncates message history to fit within limits
 * Keeps the most recent messages
 * 
 * TODO: Implement token-based truncation if needed
 * TODO: Consider summarizing older messages instead of dropping
 */
export function truncateHistory(
  messages: Message[],
  config: SessionConfig = DEFAULT_SESSION_CONFIG
): Message[] {
  const maxLength = config.maxHistoryLength || 20
  
  if (messages.length <= maxLength) {
    return messages
  }
  
  // Keep system message if present, then most recent messages
  const systemMessages = messages.filter((m) => m.role === 'system')
  const otherMessages = messages.filter((m) => m.role !== 'system')
  const recentMessages = otherMessages.slice(-maxLength)
  
  return [...systemMessages, ...recentMessages]
}

/**
 * Validates that a session ID is well-formed
 */
export function isValidSessionId(sessionId: string): boolean {
  return typeof sessionId === 'string' && sessionId.length > 0
}

