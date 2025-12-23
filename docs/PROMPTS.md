# Prompt Engineering Strategy

## Overview

The prompt system is designed to enforce:
1. **Paraphrasing** instead of quoting
2. **Transparency** between book knowledge vs. general knowledge
3. **Casual tone** throughout
4. **Non-hallucination** and honesty

## Prompt Architecture

### Layered Structure

Prompts are composed in **three layers**:

1. **System Message** (static, persona + rules)
2. **Developer Message** (dynamic, context + instructions)
3. **User Messages** (dynamic, conversation history)

### Prompt Modules

Located in `src/lib/prompts/system/`:

- **`baseSystemPrompt.md`**: Core identity, role, tone
- **`paraphrasingRules.md`**: Rules about not quoting, synthesizing
- **`sourceTransparency.md`**: Case A/B/C labeling rules
- **`safetyGuardrails.md`**: Non-hallucination, honesty rules

### Composition

At runtime, these modules are combined into a single system message:

```
[Base System Prompt]
+
[Paraphrasing Rules]
+
[Source Transparency Rules]
+
[Safety Guardrails]
=
Complete System Message
```

## Enforcing Requirements

### 1. Paraphrasing (Not Quoting)

**Enforcement:**
- Explicit rules in `paraphrasingRules.md`
- Examples of good vs. bad paraphrasing
- Instruction: "Never quote verbatim, always rephrase"

**In Practice:**
- System message includes: "Even if you have exact text, rephrase it"
- Examples show paraphrasing patterns
- Tone guidelines encourage natural explanation

### 2. Source Transparency

**Enforcement:**
- Three-case framework (A/B/C) in `sourceTransparency.md`
- Required labeling phrases for Case B and C
- Examples showing proper structure

**In Practice:**
- Case A: Answer naturally, subtle hint optional
- Case B: Clear separation with explicit labels
- Case C: Explicitly state book doesn't cover it

**Labeling Phrases:**
- "This part isn't explicitly in the book..."
- "Based on general knowledge (not from the book)..."
- "The book doesn't really talk about this..."

### 3. Casual Tone

**Enforcement:**
- Base prompt defines casual, conversational identity
- Examples show formal vs. casual rewrites
- Tone guidelines: "Talk like chatting with a friend"

**In Practice:**
- Avoid academic language
- Prefer short paragraphs
- Use everyday examples
- Show enthusiasm when appropriate

### 4. Non-Hallucination

**Enforcement:**
- Explicit guardrails in `safetyGuardrails.md`
- Rules: "Don't attribute unless confident"
- Uncertainty handling guidelines

**In Practice:**
- If context is weak, acknowledge it
- If unsure, say so explicitly
- Default to general knowledge with labeling
- Never guess and present as fact

## Prompt Composition Flow

### Step 1: Retrieve Book Context

```typescript
const bookContext = await retrieveBookContext(
  userMessage,
  vectorStoreId,
  topK: 5
)
```

### Step 2: Compose System Message

```typescript
const systemMessage = [
  baseSystemPrompt,
  paraphrasingRules,
  sourceTransparencyRules,
  safetyGuardrails
].join('\n\n')
```

### Step 3: Format Developer Message

```typescript
const developerMessage = `
BOOK CONTEXT:
${bookContext.map(c => c.content).join('\n\n')}

CONVERSATION CONTEXT:
${conversationHistory}

INSTRUCTIONS:
- Use book context to ground answers
- Follow Source Transparency rules (Case A/B/C)
- Paraphrase, don't quote
- Be casual and conversational
`
```

### Step 4: Prepare Messages Array

```typescript
const messages = [
  { role: 'system', content: systemMessage },
  { role: 'developer', content: developerMessage },
  ...conversationHistory,
  { role: 'user', content: userMessage }
]
```

## Iteration Strategy

### Testing Prompts

1. **Start with base system prompt** - Get tone right
2. **Add paraphrasing rules** - Ensure no quoting
3. **Add transparency rules** - Test Case A/B/C
4. **Add guardrails** - Test uncertainty handling

### Refining Prompts

- Test with real questions
- Check for quoting (shouldn't happen)
- Check for source labeling (should be clear)
- Check tone (should be casual)
- Check honesty (should admit uncertainty)

### Common Issues

**Issue**: Model still quotes verbatim
- **Fix**: Strengthen paraphrasing rules, add more examples

**Issue**: Source labeling unclear
- **Fix**: Make labeling phrases more explicit, add structure requirements

**Issue**: Too formal/academic
- **Fix**: Strengthen tone guidelines, add casual examples

**Issue**: Hallucinating book content
- **Fix**: Strengthen guardrails, add uncertainty handling examples

## Best Practices

1. **Keep modules focused**: Each file addresses one concern
2. **Use examples**: Show good vs. bad patterns
3. **Be explicit**: Don't assume the model will infer rules
4. **Test incrementally**: Add one module at a time, test, iterate
5. **Document decisions**: Note why certain phrasing was chosen

## Future Enhancements

- **Few-shot examples**: Add to system message for better pattern matching
- **Dynamic examples**: Select examples based on query type
- **Prompt versioning**: Track prompt changes and their effects
- **A/B testing**: Compare prompt variations

