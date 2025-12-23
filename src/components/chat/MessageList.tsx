'use client'

import { MessageItem } from './MessageItem'
import type { Message } from '@/types/chat'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

/**
 * Renders the list of chat messages
 */
export function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          Start a conversation about the book...
        </div>
      )}
      {messages.map((message, index) => (
        <MessageItem 
          key={message.timestamp ? `${message.timestamp}-${index}` : `msg-${index}`} 
          message={message} 
        />
      ))}
      {isLoading && (
        <div className="text-gray-500 italic">Thinking...</div>
      )}
    </div>
  )
}

