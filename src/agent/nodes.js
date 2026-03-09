// src/agent/nodes.js

import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// Initialize the LLM (we'll reuse this across nodes)
const llm = new ChatOpenAI({
  modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  temperature: 0.3,
});

/**
 * Summarize Node
 *
 * Takes note content from state and generates a concise summary.
 *
 * @param {object} state - The current graph state
 * @returns {object} - Updates to apply to the state
 */
export async function summarizeNode(state) {
  const { noteContent, noteTitle } = state;

  // Build the prompt
  const systemPrompt = `You are a helpful assistant that summarizes notes concisely.
Keep summaries to 2-3 sentences maximum.
Focus on the key points and action items.`;

  const userPrompt = noteTitle
    ? `Summarize this note titled "${noteTitle}":\n\n${noteContent}`
    : `Summarize this note:\n\n${noteContent}`;

  // Call the LLM
  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  // Return state updates
  return {
    summary: response.content,
    messages: [new HumanMessage(userPrompt), response],
  };
}

/**
 * Suggest Tags Node
 *
 * Analyzes note content and suggests relevant tags.
 * Uses structured output (JSON) for reliable parsing.
 *
 * Patterns used:
 * - LLM Call: Sends content to GPT for analysis
 * - Structured Output: Expects JSON array response
 * - Validation: Ensures valid string array
 * - Transform: Normalizes tags to lowercase
 */
export async function suggestTagsNode(state) {
  const { noteContent, noteTitle } = state;

  // PATTERN: LLM Call with structured output instructions
  const systemPrompt = `You are a helpful assistant that suggests tags for notes.
Analyze the content and suggest 3-5 relevant, concise tags.

Rules:
- Return ONLY a JSON array of strings
- No explanation, no markdown, no extra text
- Tags should be lowercase, single words or hyphenated
- Focus on the main topics, themes, and categories

Example output: ["meeting", "project-planning", "q2", "budget"]`;

  const userPrompt = noteTitle
    ? `Suggest tags for this note titled "${noteTitle}":\n\n${noteContent}`
    : `Suggest tags for this note:\n\n${noteContent}`;

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  // PATTERN: Parse structured output with error handling
  let tags = [];
  try {
    let content = response.content.trim();

    // Handle markdown code blocks (LLMs sometimes wrap JSON)
    if (content.startsWith('```')) {
      content = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }

    const parsed = JSON.parse(content);

    // PATTERN: Validation - ensure we have an array
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }

    // PATTERN: Transform - normalize tags
    tags = parsed
      .filter(tag => typeof tag === 'string')  // Only strings
      .map(tag => tag.toLowerCase().trim())     // Normalize
      .filter(tag => tag.length > 0)            // Remove empty
      .slice(0, 5);                              // Max 5 tags

  } catch (error) {
    console.error('Failed to parse tags:', error.message);
    console.error('Raw response:', response.content);
    // Graceful fallback - return empty array rather than failing
    tags = [];
  }

  return {
    suggestedTags: tags,
    messages: [new HumanMessage(userPrompt), response],
  };
}

/**
 * Analyze Writing Node
 * 
 * Analyzes content to determine what type of improvement is needed.
 * Returns an improvement type: 'grammar', 'clarity', or 'none'
 */
export async function analyzeWritingNode(state) {
  const { noteContent } = state;

  const systemPrompt = `You are a writing analyst. Analyze the given text and determine what type of improvement it needs most.

Respond with ONLY ONE of these exact words:
- "grammar" - if the text has spelling, punctuation, or grammatical errors
- "clarity" - if the text is grammatically correct but could be clearer or more concise
- "none" - if the text is already well-written and needs no improvement

Just respond with the single word, nothing else.`;

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(`Analyze this text:\n\n${noteContent}`),
  ]);

  const improvementType = response.content.trim().toLowerCase();
  
  // Validate response
  const validTypes = ['grammar', 'clarity', 'none'];
  const finalType = validTypes.includes(improvementType) ? improvementType : 'clarity';

  return {
    improvementType: finalType,
  };
}

/**
 * Fix Grammar Node
 * 
 * Fixes spelling, punctuation, and grammatical errors.
 */
export async function fixGrammarNode(state) {
  const { noteContent } = state;

  const systemPrompt = `You are a proofreader. Fix any spelling, punctuation, and grammatical errors in the text.
Keep the same meaning and tone. Only fix errors, don't rephrase or restructure.
Return ONLY the corrected text, nothing else.`;

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(noteContent),
  ]);

  return {
    improvedContent: response.content,
  };
}

/**
 * Improve Clarity Node
 * 
 * Makes text clearer and more concise while preserving meaning.
 */
export async function improveClarityNode(state) {
  const { noteContent } = state;

  const systemPrompt = `You are an editor focused on clarity. Improve the text to be clearer and more concise.
- Remove unnecessary words
- Simplify complex sentences
- Improve flow and readability
- Preserve the original meaning and tone

Return ONLY the improved text, nothing else.`;

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(noteContent),
  ]);

  return {
    improvedContent: response.content,
  };
}

/**
 * No Improvement Node
 * 
 * Returns the original content when no improvement is needed.
 */
export function noImprovementNode(state) {
  return {
    improvedContent: state.noteContent,
  };
}