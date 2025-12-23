'use client'

import { useState } from 'react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import type { Message, ChatRequest, ChatResponse } from '@/types/chat'

interface ChatWindowProps {
  sessionId: string
}

/**
 * Main chat window component
 * Manages message state and handles sending messages to API
 */
export function ChatWindow({ sessionId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSendMessage = async (content: string) => {
    // Add user message to state immediately for optimistic UI
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    }
    
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)
    setError(null)

    try {
      // Prepare request body
      const requestBody: ChatRequest = {
        sessionId,
        messages: updatedMessages,
      }

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const data: ChatResponse = await response.json()

      // Add assistant response to messages
      setMessages((prev) => [...prev, data.message])
    } catch (err: any) {
      console.error('Error sending message:', err)
      setError(err.message || 'Failed to send message')
      // Remove the user message on error so they can retry
      setMessages(messages)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 m-4 rounded">
          Error: {error}
          <button
            onClick={() => setError(null)}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  )
}
