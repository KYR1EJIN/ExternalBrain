'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'outline'
}

/**
 * Reusable button component
 */
export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors'
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50',
    outline: 'border border-gray-300 hover:bg-gray-50 disabled:opacity-50',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

