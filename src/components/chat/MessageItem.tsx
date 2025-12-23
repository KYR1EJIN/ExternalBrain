'use client'

import type { Message } from '@/types/chat'

interface MessageItemProps {
  message: Message
}

/**
 * Renders a single chat message bubble
 * TODO: Add source labeling (book vs general knowledge) when available
 */
export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {/* TODO: Add source label badge if message has metadata */}
      </div>
    </div>
  )
}

