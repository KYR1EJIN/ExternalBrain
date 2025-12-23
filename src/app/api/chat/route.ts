import { NextRequest } from 'next/server'
import { retrieveBookContext } from '@/lib/openai/vectorStore'
import { generateChatResponseStream } from '@/lib/openai/chatEngine'
import { truncateHistory } from '@/lib/session/sessionUtils'
import { isValidSessionId } from '@/lib/session/sessionUtils'
import type { ChatRequest } from '@/types/chat'
import { getOpenAIVectorStoreId } from '@/lib/config/env'

/**
 * POST /api/chat
 * 
 * Main chat endpoint with streaming support.
 * 
 * Request body:
 * {
 *   sessionId: string,
 *   messages: Array<{ role: 'user' | 'assistant', content: string, timestamp?: number }>,
 *   bookId?: string
 * }
 * 
 * Response: Streaming text/event-stream
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: ChatRequest = await request.json()

    if (!body.sessionId || !isValidSessionId(body.sessionId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing sessionId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid or empty messages array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get the last user message (the current question)
    const userMessages = body.messages.filter((m) => m.role === 'user')
    if (userMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No user message found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const currentUserMessage = userMessages[userMessages.length - 1]
    const userMessageContent = currentUserMessage.content.trim()

    if (!userMessageContent) {
      return new Response(
        JSON.stringify({ error: 'User message is empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Truncate conversation history to stay within limits
    const conversationHistory = truncateHistory(body.messages)

    // Retrieve book context from vector store
    const vectorStoreId = getOpenAIVectorStoreId()
    let bookContext: Array<{ content: string }> = []

    if (vectorStoreId) {
      try {
        bookContext = await retrieveBookContext(
          userMessageContent,
          vectorStoreId,
          5 // topK
        )
      } catch (error: any) {
        const isVectorStoreNotFound = 
          error?.status === 404 || 
          error?.code === 'not_found' ||
          (error?.error?.message && error.error.message.includes('not found'))
        
        if (isVectorStoreNotFound) {
          console.warn(`Vector store ${vectorStoreId} not found. Please verify your OPENAI_VECTOR_STORE_ID in .env.local`)
        } else {
          console.error('Error retrieving book context:', error?.message || error)
        }
        bookContext = []
      }
    } else {
      console.warn('No vector store ID configured, proceeding without book context')
    }

    // Generate streaming chat response
    const stream = await generateChatResponseStream(
      userMessageContent,
      conversationHistory,
      bookContext,
      body.bookId
    )

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
