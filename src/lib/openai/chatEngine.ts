import { getOpenAIClient } from './client'
import { OPENAI_MODEL } from '@/lib/config/env'
import { composeSystemPrompt, composeDeveloperMessage } from '@/lib/prompts/compose'
import type { Message } from '@/types/chat'

/**
 * Generates a streaming chat response using book context and conversation history
 * 
 * @param userMessage - The user's current message
 * @param conversationHistory - Previous messages in the session (excluding system/developer messages)
 * @param bookContext - Retrieved book passages
 * @param bookId - Optional book identifier
 * @returns ReadableStream of response chunks
 */
export async function generateChatResponseStream(
  userMessage: string,
  conversationHistory: Message[],
  bookContext: Array<{ content: string }>,
  bookId?: string
): Promise<ReadableStream<Uint8Array>> {
  const openai = getOpenAIClient()

  // Compose system prompt from markdown files
  const systemPrompt = composeSystemPrompt()

  // Compose developer message with book context
  const developerMessage = composeDeveloperMessage(
    bookContext,
    conversationHistory.length
  )

  // Build messages array for OpenAI API
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

  // Add conversation history (filter out system messages)
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
    // Call OpenAI chat completion with streaming
    const stream = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    })

    // Convert OpenAI stream to ReadableStream
    const encoder = new TextEncoder()
    
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })
  } catch (error: any) {
    console.error('Error generating chat response stream:', error)
    throw new Error(`Failed to generate response: ${error.message}`)
  }
}

/**
 * Generates a chat response using book context and conversation history (non-streaming)
 * 
 * @deprecated Use generateChatResponseStream for better UX
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
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 2000,
    })

    const assistantMessage = completion.choices[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response from OpenAI')
    }

    // Determine source type based on book context availability
    let sourceType: 'book' | 'general' | 'mixed' = 'general'
    
    if (bookContext.length > 0) {
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
