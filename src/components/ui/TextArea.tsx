'use client'

import { TextareaHTMLAttributes } from 'react'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  // Additional props can be added here
}

/**
 * Reusable textarea component
 */
export function TextArea({ className = '', ...props }: TextAreaProps) {
  return (
    <textarea
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
}

