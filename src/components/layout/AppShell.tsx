'use client'

import { ChatLayout } from './ChatLayout'

/**
 * Main app shell component
 * Provides the overall layout structure for the application
 */
export function AppShell() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="border-b p-4">
        <h1 className="text-xl font-semibold">Kyrie&apos;s External Brain</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatLayout />
      </main>
    </div>
  )
}

