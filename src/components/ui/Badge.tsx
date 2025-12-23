'use client'

import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'info' | 'warning' | 'success'
}

/**
 * Badge component for labeling source types (book vs general knowledge)
 */
export function Badge({ children, variant = 'info' }: BadgeProps) {
  const variantStyles = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    success: 'bg-green-100 text-green-800',
  }

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded ${variantStyles[variant]}`}
    >
      {children}
    </span>
  )
}

