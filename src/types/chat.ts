/**
 * Shared types for chat messages and session management
 */

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  role: MessageRole
  content: string
  timestamp?: number
}

export interface ChatSession {
  sessionId: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  title?: string
  bookId?: string
}

export interface ChatRequest {
  sessionId: string
  messages: Message[]
  bookId?: string
}

export interface ChatResponse {
  message: Message
  sessionId: string
}
