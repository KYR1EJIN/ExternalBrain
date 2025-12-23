'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '@/types/chat'

interface MessageItemProps {
  message: Message
}

/**
 * Renders a single chat message bubble with markdown support
 */
export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-3xl rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Customize code blocks
                code: ({ node, inline, className, children, ...props }: any) => {
                  return inline ? (
                    <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-gray-200 dark:bg-gray-800 p-2 rounded text-sm overflow-x-auto" {...props}>
                      {children}
                    </code>
                  )
                },
                // Customize links
                a: ({ node, ...props }: any) => (
                  <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                ),
                // Customize lists
                ul: ({ node, ...props }: any) => (
                  <ul className="list-disc list-inside my-2" {...props} />
                ),
                ol: ({ node, ...props }: any) => (
                  <ol className="list-decimal list-inside my-2" {...props} />
                ),
                // Customize blockquotes
                blockquote: ({ node, ...props }: any) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {/* TODO: Add source label badge if message has metadata */}
      </div>
    </div>
  )
}
