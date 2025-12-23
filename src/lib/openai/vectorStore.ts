import { getOpenAIClient } from './client'
import { getOpenAIVectorStoreId } from '@/lib/config/env'
import { appConfig } from '@/lib/config/appConfig'

/**
 * Retrieves relevant book context from OpenAI vector store
 * 
 * Uses the direct vector store search API for simpler and more reliable retrieval.
 * 
 * @param query - User's question or message
 * @param vectorStoreId - OpenAI vector store ID (optional, uses default if not provided)
 * @param topK - Number of top results to return (default: 5)
 * @returns Array of relevant book passages
 */
export async function retrieveBookContext(
  query: string,
  vectorStoreId?: string,
  topK: number = appConfig.defaultTopK
): Promise<Array<{ content: string; metadata?: Record<string, any> }>> {
  const openai = getOpenAIClient()
  const storeId = vectorStoreId || getOpenAIVectorStoreId()

  if (!storeId) {
    console.warn('No vector store ID provided, returning empty context')
    return []
  }

  try {
    // Use the direct vector store search API
    // Note: vectorStores is directly on openai, not under beta
    const searchResults = await openai.vectorStores.search(storeId, {
      query: query,
      max_num_results: topK, // Limit results (between 1 and 50)
    })

    const results: Array<{ content: string; metadata?: Record<string, any> }> = []

    // Extract content from search results
    // The search API returns pages, iterate through them
    for await (const result of searchResults) {
      // Each result is a VectorStoreSearchResponse
      // Extract text content from each result
      if (result.content && Array.isArray(result.content)) {
        const textParts: string[] = []
        
        for (const contentItem of result.content) {
          if (contentItem.type === 'text' && contentItem.text) {
            textParts.push(contentItem.text)
          }
        }
        
        if (textParts.length > 0) {
          const combinedText = textParts.join('\n')
          results.push({
            content: combinedText,
            metadata: {
              score: result.score,
              file_id: result.file_id,
              filename: result.filename,
            },
          })
        }
      }
    }

    // If no results found, log a warning
    if (results.length === 0) {
      console.warn(`No content found in vector store for query: "${query}"`)
    } else {
      console.log(`Retrieved ${results.length} chunks from vector store`)
    }

    // Return results (already limited by topK in the API call)
    return results
  } catch (error: any) {
    // Handle specific error cases
    if (error.status === 404 || error.code === 'not_found' || 
        (error.error && error.error.message && error.error.message.includes('not found'))) {
      console.warn(`Vector store ${storeId} not found. Continuing without book context.`)
      return []
    }
    
    console.error('Error retrieving book context:', error.message || error)
    // Return empty array on error to allow chat to continue with general knowledge
    return []
  }
}
