'use client'

import { useState, useEffect } from 'react'
import { ChatWindow } from '../chat/ChatWindow'
import { ChatSidebar } from '../chat/ChatSidebar'
import { generateSessionId } from '@/lib/session/sessionUtils'
import {
  loadSessions,
  saveSession,
  deleteSession as deleteSessionStorage,
  generateSessionTitle,
} from '@/lib/session/sessionStorage'
import type { ChatSession, Message } from '@/types/chat'

/**
 * Chat layout component
 * Manages sidebar (chat history) and main chat window
 */
export function ChatLayout() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    // Generate initial session ID
    return generateSessionId()
  })

  // Load sessions from localStorage on mount
  useEffect(() => {
    const loadedSessions = loadSessions()
    setSessions(loadedSessions)
    
    // If there are existing sessions, use the most recent one
    if (loadedSessions.length > 0) {
      const mostRecent = loadedSessions.sort((a, b) => b.updatedAt - a.updatedAt)[0]
      setCurrentSessionId(mostRecent.sessionId)
    }
  }, [])

  // Get current session
  const currentSession = sessions.find((s) => s.sessionId === currentSessionId) || {
    sessionId: currentSessionId,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  // Handle new chat
  const handleNewChat = () => {
    // Save current session before creating new one
    if (currentSession.messages.length > 0) {
      const sessionToSave: ChatSession = {
        ...currentSession,
        updatedAt: Date.now(),
        title: currentSession.title || generateSessionTitle(currentSession.messages),
      }
      saveSession(sessionToSave)
      
      // Update sessions list
      const updatedSessions = sessions.filter(
        (s) => s.sessionId !== currentSessionId
      )
      updatedSessions.push(sessionToSave)
      setSessions(updatedSessions)
    }

    // Create new session
    const newSessionId = generateSessionId()
    setCurrentSessionId(newSessionId)
  }

  // Handle session selection
  const handleSelectSession = (sessionId: string) => {
    // Save current session before switching
    if (currentSession.messages.length > 0) {
      const sessionToSave: ChatSession = {
        ...currentSession,
        updatedAt: Date.now(),
        title: currentSession.title || generateSessionTitle(currentSession.messages),
      }
      saveSession(sessionToSave)
      
      const updatedSessions = sessions.map((s) =>
        s.sessionId === currentSessionId ? sessionToSave : s
      )
      setSessions(updatedSessions)
    }

    // Load selected session
    const selectedSession = sessions.find((s) => s.sessionId === sessionId)
    if (selectedSession) {
      setCurrentSessionId(sessionId)
    } else {
      // If session not found, create new one
      setCurrentSessionId(sessionId)
    }
  }

  // Handle messages change
  const handleMessagesChange = (messages: Message[]) => {
    const updatedSession: ChatSession = {
      ...currentSession,
      messages,
      updatedAt: Date.now(),
      title: currentSession.title || generateSessionTitle(messages),
    }

    // Update sessions list
    const updatedSessions = sessions.filter(
      (s) => s.sessionId !== currentSessionId
    )
    updatedSessions.push(updatedSession)
    setSessions(updatedSessions)

    // Save to localStorage
    saveSession(updatedSession)
  }

  // Handle session deletion
  const handleDeleteSession = (sessionId: string) => {
    deleteSessionStorage(sessionId)
    const updatedSessions = sessions.filter((s) => s.sessionId !== sessionId)
    setSessions(updatedSessions)

    // If deleting current session, create a new one
    if (sessionId === currentSessionId) {
      const newSessionId = generateSessionId()
      setCurrentSessionId(newSessionId)
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 border-r flex-shrink-0">
        <ChatSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
        />
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow
          sessionId={currentSessionId}
          messages={currentSession.messages}
          onMessagesChange={handleMessagesChange}
        />
      </div>
    </div>
  )
}
