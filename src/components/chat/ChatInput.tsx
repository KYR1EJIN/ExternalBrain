'use client'

import { useState, KeyboardEvent } from 'react'
import { Button } from '../ui/Button'
import { TextArea } from '../ui/TextArea'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
}

/**
 * Chat input component with textarea and send button
 */
export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the book..."
          disabled={disabled}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={disabled || !input.trim()}>
          Send
        </Button>
      </div>
    </div>
  )
}

