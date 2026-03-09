// src/agent/state.js

import { Annotation, messagesStateReducer } from '@langchain/langgraph';

/**
 * NoteFlow Agent State
 *
 * Defines the data our agent works with.
 * We'll expand this as we add more features.
 */
export const NoteFlowState = Annotation.Root({
  // The note content to process
  noteContent: Annotation({
    default: () => '',
  }),

  // The note title (for context)
  noteTitle: Annotation({
    default: () => '',
  }),

  // Conversation with the LLM
  messages: Annotation({
    default: () => [],
    reducer: messagesStateReducer,
  }),

  // AI-generated summary
  summary: Annotation({
    default: () => null,
  }),

  // AI-suggested tags
  suggestedTags: Annotation({
    default: () => [],
  }),

  // Error tracking
  error: Annotation({
    default: () => null,
  }),

  // Type of improvement needed (grammar, clarity, none)
  improvementType: Annotation({
    default: () => null,
  }),

  // Improved version of the content
  improvedContent: Annotation({
    default: () => null,
  }),

  // Content to analyze for finding related notes
  analyzeContent: Annotation({ default: () => '' }),

  // Query for Smart Search (web search)
  searchQuery: Annotation({ default: () => '' }),
});

export default NoteFlowState;