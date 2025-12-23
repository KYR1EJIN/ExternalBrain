import { getOpenAIClient } from './client'
import { OPENAI_MODEL } from '@/lib/config/env'
import { composeSystemPrompt, composeDeveloperMessage } from '@/lib/prompts/compose'
import type { Message } from '@/types/chat'

/**
 * Generates a chat response using book context and conversation history
 * 
 * @param userMessage - The user's current message
 * @param conversationHistory - Previous messages in the session (excluding system/developer messages)
 * @param bookContext - Retrieved book passages
 * @param bookId - Optional book identifier
 * @returns Assistant response with optional source labeling
 */
export async function generateChatResponse(
  userMessage: string,
  conversationHistory: Message[],
  bookContext: Array<{ content: string }>,
  bookId?: string
): Promise<{ content: string; sourceType?: 'book' | 'general' | 'mixed' }> {
  const openai = getOpenAIClient()

  // Compose system prompt from markdown files
  const systemPrompt = composeSystemPrompt()

  // Compose developer message with book context
  const developerMessage = composeDeveloperMessage(
    bookContext,
    conversationHistory.length
  )

  // Build messages array for OpenAI API
  // OpenAI chat completion format: system, user, assistant, user, ...
  const messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }> = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: developerMessage,
    },
  ]

  // Add conversation history (filter out system messages, they're already in system prompt)
  const conversationMessages = conversationHistory.filter(
    (msg) => msg.role !== 'system'
  )

  // Convert conversation history to OpenAI format
  for (const msg of conversationMessages) {
    if (msg.role === 'user' || msg.role === 'assistant') {
      messages.push({
        role: msg.role,
        content: msg.content,
      })
    }
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage,
  })

  try {
    // Call OpenAI chat completion
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: messages as any, // Type assertion needed due to OpenAI SDK types
      temperature: 0.7, // Balanced creativity
      max_tokens: 1000, // Reasonable response length
    })

    const assistantMessage = completion.choices[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response from OpenAI')
    }

    // Determine source type based on book context availability
    // This is a simple heuristic - in production you might want more sophisticated detection
    let sourceType: 'book' | 'general' | 'mixed' = 'general'
    
    if (bookContext.length > 0) {
      // Check if response mentions book or seems to use book knowledge
      const responseLower = assistantMessage.toLowerCase()
      const hasBookMention = 
        responseLower.includes('book') ||
        responseLower.includes('the book') ||
        responseLower.includes('author')
      
      const hasGeneralKnowledgeLabel = 
        responseLower.includes('general knowledge') ||
        responseLower.includes('not from the book') ||
        responseLower.includes('not explicitly in the book')
      
      if (hasBookMention && hasGeneralKnowledgeLabel) {
        sourceType = 'mixed'
      } else if (hasBookMention) {
        sourceType = 'book'
      } else if (hasGeneralKnowledgeLabel) {
        sourceType = 'general'
      } else {
        // Default to mixed if we have context but unclear labeling
        sourceType = 'mixed'
      }
    }

    return {
      content: assistantMessage,
      sourceType,
    }
  } catch (error: any) {
    console.error('Error generating chat response:', error)
    throw new Error(`Failed to generate response: ${error.message}`)
  }
}
