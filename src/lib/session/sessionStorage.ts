import type { ChatSession } from '@/types/chat'

const STORAGE_KEY = 'external_brain_chat_sessions'
const MAX_SESSIONS = 50 // Limit stored sessions

/**
 * Loads chat sessions from localStorage
 */
export function loadSessions(): ChatSession[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }
    return JSON.parse(stored) as ChatSession[]
  } catch (error) {
    console.error('Error loading sessions from localStorage:', error)
    return []
  }
}

/**
 * Saves chat sessions to localStorage
 */
export function saveSessions(sessions: ChatSession[]): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    // Limit number of stored sessions
    const sessionsToSave = sessions
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_SESSIONS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionsToSave))
  } catch (error) {
    console.error('Error saving sessions to localStorage:', error)
  }
}

/**
 * Gets a specific session by ID
 */
export function getSession(sessionId: string): ChatSession | null {
  const sessions = loadSessions()
  return sessions.find((s) => s.sessionId === sessionId) || null
}

/**
 * Saves or updates a session
 */
export function saveSession(session: ChatSession): void {
  const sessions = loadSessions()
  const existingIndex = sessions.findIndex((s) => s.sessionId === session.sessionId)
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session
  } else {
    sessions.push(session)
  }
  
  saveSessions(sessions)
}

/**
 * Deletes a session
 */
export function deleteSession(sessionId: string): void {
  const sessions = loadSessions()
  const filtered = sessions.filter((s) => s.sessionId !== sessionId)
  saveSessions(filtered)
}

/**
 * Generates a title from the first user message
 */
export function generateSessionTitle(messages: ChatSession['messages']): string {
  const firstUserMessage = messages.find((m) => m.role === 'user')
  if (firstUserMessage) {
    const title = firstUserMessage.content.slice(0, 50).trim()
    return title.length < firstUserMessage.content.length ? `${title}...` : title
  }
  return 'New Chat'
}

