'use client'

import { Button } from '../ui/Button'

interface NewChatButtonProps {
  onClick: () => void
}

/**
 * Button to start a new chat session
 * Resets conversation memory while keeping book knowledge access
 */
export function NewChatButton({ onClick }: NewChatButtonProps) {
  return (
    <Button onClick={onClick} variant="outline" className="w-full">
      + New Chat
    </Button>
  )
}

