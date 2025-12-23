'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import type { Message, ChatRequest } from '@/types/chat'

interface ChatWindowProps {
  sessionId: string
  messages: Message[]
  onMessagesChange: (messages: Message[]) => void
}

/**
 * Main chat window component
 * Manages message state and handles sending messages to API with streaming
 */
export function ChatWindow({ sessionId, messages, onMessagesChange }: ChatWindowProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleSendMessage = async (content: string) => {
    // Add user message to state immediately for optimistic UI
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    }
    
    const updatedMessages = [...messages, userMessage]
    onMessagesChange(updatedMessages)
    setIsLoading(true)
    setError(null)

    // Create assistant message placeholder for streaming
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }
    const messagesWithAssistant = [...updatedMessages, assistantMessage]
    onMessagesChange(messagesWithAssistant)

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController()

    try {
      // Prepare request body
      const requestBody: ChatRequest = {
        sessionId,
        messages: updatedMessages,
      }

      // Call API with streaming
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          break
        }

        // Decode chunk and append to accumulated content
        const chunk = decoder.decode(value, { stream: true })
        accumulatedContent += chunk

        // Update assistant message with accumulated content
        const updatedAssistantMessage: Message = {
          ...assistantMessage,
          content: accumulatedContent,
        }
        const updatedMessagesWithStreaming = [...updatedMessages, updatedAssistantMessage]
        onMessagesChange(updatedMessagesWithStreaming)
      }
    } catch (err: any) {
      // Don't show error if it's an abort
      if (err.name === 'AbortError') {
        return
      }
      
      console.error('Error sending message:', err)
      setError(err.message || 'Failed to send message')
      // Remove the assistant message placeholder on error
      onMessagesChange(updatedMessages)
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

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
