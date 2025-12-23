import { NextRequest, NextResponse } from 'next/server'
import { retrieveBookContext } from '@/lib/openai/vectorStore'
import { generateChatResponse } from '@/lib/openai/chatEngine'
import { truncateHistory } from '@/lib/session/sessionUtils'
import { isValidSessionId } from '@/lib/session/sessionUtils'
import type { ChatRequest, ChatResponse, Message } from '@/types/chat'
import { getOpenAIVectorStoreId } from '@/lib/config/env'

/**
 * POST /api/chat
 * 
 * Main chat endpoint. Handles user messages and returns assistant responses.
 * 
 * Request body:
 * {
 *   sessionId: string,
 *   messages: Array<{ role: 'user' | 'assistant', content: string, timestamp?: number }>,
 *   bookId?: string
 * }
 * 
 * Response:
 * {
 *   message: { role: 'assistant', content: string, timestamp: number },
 *   sessionId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: ChatRequest = await request.json()

    if (!body.sessionId || !isValidSessionId(body.sessionId)) {
      return NextResponse.json(
        { error: 'Invalid or missing sessionId' },
        { status: 400 }
      )
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty messages array' },
        { status: 400 }
      )
    }

    // Get the last user message (the current question)
    const userMessages = body.messages.filter((m) => m.role === 'user')
    if (userMessages.length === 0) {
      return NextResponse.json(
        { error: 'No user message found' },
        { status: 400 }
      )
    }

    const currentUserMessage = userMessages[userMessages.length - 1]
    const userMessageContent = currentUserMessage.content.trim()

    if (!userMessageContent) {
      return NextResponse.json(
        { error: 'User message is empty' },
        { status: 400 }
      )
    }

    // Truncate conversation history to stay within limits
    const conversationHistory = truncateHistory(body.messages)

    // Retrieve book context from vector store
    // Use the user's current message as the query
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
        // Check if it's a "vector store not found" error
        const isVectorStoreNotFound = 
          error?.status === 404 || 
          error?.code === 'not_found' ||
          (error?.error?.message && error.error.message.includes('not found'))
        
        if (isVectorStoreNotFound) {
          console.warn(`Vector store ${vectorStoreId} not found. Please verify your OPENAI_VECTOR_STORE_ID in .env.local`)
        } else {
          console.error('Error retrieving book context:', error?.message || error)
        }
        // Continue without book context - chat engine will use general knowledge
        bookContext = []
      }
    } else {
      console.warn('No vector store ID configured, proceeding without book context')
    }

    // Generate chat response using book context and conversation history
    const response = await generateChatResponse(
      userMessageContent,
      conversationHistory,
      bookContext,
      body.bookId
    )

    // Format response message
    const assistantMessage: Message = {
      role: 'assistant',
      content: response.content,
      timestamp: Date.now(),
    }

    const chatResponse: ChatResponse = {
      message: assistantMessage,
      sessionId: body.sessionId,
    }

    return NextResponse.json(chatResponse)
  } catch (error: any) {
    console.error('Chat API error:', error)
    
    // Return user-friendly error message
    const errorMessage = error.message || 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
