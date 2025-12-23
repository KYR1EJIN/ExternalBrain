# Architecture Documentation

## System Overview

**Kyrie's External Brain** is a Next.js web application that provides a ChatGPT-like interface for discussing books using OpenAI's API and vector store.

## High-Level Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│   - Chat UI     │
│   - Session Mgmt│
└────────┬────────┘
         │
         │ HTTP POST /api/chat
         │
┌────────▼─────────────────────────┐
│   API Route                       │
│   /api/chat/route.ts              │
│   - Request validation            │
│   - Session handling              │
│   - Orchestration                 │
└────────┬──────────────────────────┘
         │
         ├──────────────────┬──────────────────┐
         │                  │                  │
┌────────▼────────┐  ┌─────▼──────┐  ┌───────▼────────┐
│ Vector Store    │  │ Chat Engine │  │ Prompt Builder │
│ Retrieval      │  │             │  │                │
│                 │  │             │  │                │
└────────┬────────┘  └─────┬───────┘  └───────┬────────┘
         │                 │                   │
         │                 │                   │
┌────────▼─────────────────▼───────────────────▼────────┐
│              OpenAI API                               │
│  - Vector Store (book knowledge)                     │
│  - Chat Completions (response generation)            │
└───────────────────────────────────────────────────────┘
```

## Component Responsibilities

### Frontend (`src/app/` & `src/components/`)

- **`app/page.tsx`**: Main entry point, renders `AppShell`
- **`app/layout.tsx`**: Root layout with metadata
- **`components/layout/AppShell.tsx`**: Top-level app structure
- **`components/layout/ChatLayout.tsx`**: Sidebar + chat window layout
- **`components/chat/ChatWindow.tsx`**: Manages message state and API calls
- **`components/chat/MessageList.tsx`**: Renders message history
- **`components/chat/MessageItem.tsx`**: Individual message bubble
- **`components/chat/ChatInput.tsx`**: Input field and send button
- **`components/chat/NewChatButton.tsx`**: Resets session

### Backend (`src/app/api/chat/`)

- **`route.ts`**: Single API endpoint for all chat requests
  - Validates request body
  - Retrieves book context
  - Composes prompts
  - Calls OpenAI
  - Returns response

### Business Logic (`src/lib/`)

#### OpenAI Integration (`lib/openai/`)

- **`client.ts`**: OpenAI client initialization
- **`vectorStore.ts`**: Vector store retrieval functions
- **`chatEngine.ts`**: Main chat orchestration logic

#### Session Management (`lib/session/`)

- **`sessionTypes.ts`**: Type definitions
- **`sessionUtils.ts`**: Session ID generation, history truncation

#### Configuration (`lib/config/`)

- **`env.ts`**: Environment variable validation
- **`appConfig.ts`**: Application settings and feature flags

#### Prompts (`lib/prompts/`)

- **`system/*.md`**: Prompt building blocks (persona, rules, guardrails)
- **`templates/*.md`**: Prompt composition structure and examples

## Data Flow

### Chat Request Flow

1. **User types message** → `ChatInput` component
2. **`ChatWindow` sends POST** → `/api/chat` with `sessionId`, `messages`, `bookId`
3. **API route validates** → Request body and environment
4. **Retrieve book context** → `vectorStore.retrieveBookContext(query, vectorStoreId)`
5. **Compose prompts** → System + Developer + User messages
6. **Call OpenAI** → `chatEngine.generateChatResponse(...)`
7. **Return response** → JSON with assistant message
8. **Update UI** → Add message to `ChatWindow` state

### Session Management Flow

1. **New chat clicked** → Generate new `sessionId` (timestamp-based)
2. **Clear messages** → Reset `ChatWindow` state
3. **Each request** → Include `sessionId` in API call
4. **Backend** → Uses `sessionId` as logical boundary (no persistence)

## Key Design Decisions

### 1. Stateless Sessions

- Sessions are logical, not persisted
- Frontend generates `sessionId` and includes it in requests
- Backend treats each request independently
- No database needed for MVP

### 2. Client-Side Memory

- Conversation history stored in React state
- Sent to backend with each request
- Backend truncates if needed (per `sessionConfig`)
- "New chat" = new `sessionId` + cleared state

### 3. Prompt Modularity

- Prompts split into focused markdown files
- Easy to iterate on individual aspects
- Composed at runtime in API route
- Clear separation of concerns

### 4. Thin Backend

- API route is mostly orchestration
- Business logic in `lib/` modules
- Easy to test and extend
- No complex state management

## Extension Points

### Multiple Books

- Add `bookId` parameter to requests
- Store multiple `vectorStoreId`s in config
- Select based on `bookId` in API route

### Streaming Responses

- Use OpenAI streaming API
- Return `ReadableStream` from API route
- Update `ChatWindow` to handle streaming

### Server-Side Memory

- Add KV store (e.g., Vercel KV, Redis)
- Key: `sessionId`, Value: `Message[]`
- Load/save in API route

### Source Labeling UI

- Parse `sourceType` from API response
- Add badges to `MessageItem` component
- Style differently for book vs. general knowledge

## Technology Choices

- **Next.js**: Unified frontend/backend, great DX, easy deployment
- **TypeScript**: Type safety, better IDE support
- **Tailwind CSS**: Fast iteration, consistent styling
- **OpenAI API**: Vector store + chat completions in one ecosystem

## File Organization Philosophy

- **Clear boundaries**: Each folder has a single responsibility
- **Easy navigation**: Related files grouped together
- **Cursor-friendly**: Small, focused files easy to generate/edit
- **Extensible**: Easy to add features without restructuring

