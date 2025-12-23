'use client'

import { ChatSession } from '@/types/chat'
import { Button } from '../ui/Button'

interface ChatSidebarProps {
  sessions: ChatSession[]
  currentSessionId: string
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
  onDeleteSession?: (sessionId: string) => void
}

/**
 * Sidebar component showing chat history
 */
export function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: ChatSidebarProps) {
  // Generate title from first user message if no title set
  const getSessionTitle = (session: ChatSession): string => {
    if (session.title) {
      return session.title
    }
    const firstUserMessage = session.messages.find((m) => m.role === 'user')
    if (firstUserMessage) {
      // Truncate to 50 chars
      const title = firstUserMessage.content.slice(0, 50)
      return title.length < firstUserMessage.content.length ? `${title}...` : title
    }
    return 'New Chat'
  }

  // Format date for display
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Sort sessions by updatedAt (most recent first)
  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* New Chat Button */}
      <div className="p-4 border-b">
        <Button onClick={onNewChat} className="w-full" variant="primary">
          + New Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        {sortedSessions.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            No chat history
          </div>
        ) : (
          <div className="p-2">
            {sortedSessions.map((session) => {
              const isActive = session.sessionId === currentSessionId
              return (
                <div
                  key={session.sessionId}
                  className={`group mb-1 rounded-lg p-3 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-blue-100 border border-blue-300'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => onSelectSession(session.sessionId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {getSessionTitle(session)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(session.updatedAt)}
                      </div>
                    </div>
                    {onDeleteSession && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteSession(session.sessionId)
                        }}
                        className="opacity-0 group-hover:opacity-100 ml-2 text-gray-400 hover:text-red-500 transition-opacity"
                        title="Delete chat"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

