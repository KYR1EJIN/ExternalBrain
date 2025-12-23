import type { Message } from '@/types/chat'

/**
 * Session-related types
 */

export interface SessionState {
  sessionId: string
  messages: Message[]
  createdAt: number
  lastActivityAt: number
  bookId?: string
}

/**
 * Configuration for session memory management
 */
export interface SessionConfig {
  maxHistoryLength?: number // Max messages to keep in history
  maxHistoryTokens?: number // Max tokens in history (for truncation)
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxHistoryLength: 20, // Keep last 20 messages
  maxHistoryTokens: 4000, // Approximate token limit
}

