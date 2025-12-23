'use client'

import { useState } from 'react'
import { ChatWindow } from '../chat/ChatWindow'
import { NewChatButton } from '../chat/NewChatButton'

/**
 * Chat layout component
 * Manages sidebar (new chat button) and main chat window
 */
export function ChatLayout() {
  const [sessionId, setSessionId] = useState<string>(() => {
    // Generate initial session ID
    return `session-${Date.now()}`
  })

  const handleNewChat = () => {
    // Generate new session ID to reset memory
    setSessionId(`session-${Date.now()}`)
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 border-r p-4">
        <NewChatButton onClick={handleNewChat} />
      </aside>

      {/* Main chat area */}
      <div className="flex-1">
        <ChatWindow sessionId={sessionId} />
      </div>
    </div>
  )
}

