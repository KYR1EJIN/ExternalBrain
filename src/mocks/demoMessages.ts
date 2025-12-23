import type { Message } from '@/types/chat'

/**
 * Demo messages for UI development
 * Remove or replace when real API is connected
 */
export const demoMessages: Message[] = [
  {
    role: 'user',
    content: 'What is the main idea of the book?',
    timestamp: Date.now() - 60000,
  },
  {
    role: 'assistant',
    content:
      'The book explores how our understanding of knowledge evolves over time. It argues that true learning comes from synthesis rather than memorization.',
    timestamp: Date.now() - 30000,
  },
  {
    role: 'user',
    content: 'Can you give me an example?',
    timestamp: Date.now() - 10000,
  },
]

