// src/agent/graph.js

import { StateGraph, END } from '@langchain/langgraph';
import { NoteFlowState } from './state.js';
import { 
    summarizeNode, 
    suggestTagsNode,
    analyzeWritingNode,
    fixGrammarNode,
    improveClarityNode,
    noImprovementNode
} from './nodes.js';

import { ToolNode, toolsCondition } from '@langchain/langgraph/prebuilt';
import { noteFlowTools, webSearchTools } from './tools.js';
import { ChatOpenAI } from "@langchain/openai";


/**
 * Create the Summarize Graph
 * 
 * A simple graph: START → summarize → END
 */
export function createSummarizeGraph() {
  const graph = new StateGraph(NoteFlowState)
    // Add our node
    .addNode('summarize', summarizeNode)
    // Connect: START → summarize
    .addEdge('__start__', 'summarize')
    // Connect: summarize → END
    .addEdge('summarize', END);

  // Compile and return the executable graph
  return graph.compile();
}

/**
 * Create the Suggest Tags Graph
 * Flow: START → suggestTags → END
 */
export function createSuggestTagsGraph() {
  const graph = new StateGraph(NoteFlowState)
    .addNode('suggestTags', suggestTagsNode)
    .addEdge('__start__', 'suggestTags')
    .addEdge('suggestTags', END);

  return graph.compile();
}

/**
 * Improvement Router
 * 
 * Routes to the appropriate improvement node based on analysis.
 */
function improvementRouter(state) {
  const { improvementType } = state;
  
  switch (improvementType) {
    case 'grammar':
      return 'grammar';
    case 'clarity':
      return 'clarity';
    case 'none':
    default:
      return 'none';
  }
}

/**
 * Create the Improve Writing Graph
 * 
 * A graph with conditional edges that routes to different
 * improvement strategies based on content analysis.
 * 
 * Flow:
 *   START → analyze → [conditional] → grammar/clarity/none → END
 */
export function createImproveWritingGraph() {
  const graph = new StateGraph(NoteFlowState)
    // Add all nodes
    .addNode('analyze', analyzeWritingNode)
    .addNode('fixGrammar', fixGrammarNode)
    .addNode('improveClarity', improveClarityNode)
    .addNode('noImprovement', noImprovementNode)
    
    // Entry edge
    .addEdge('__start__', 'analyze')
    
    // Conditional edge from analyze node
    .addConditionalEdges('analyze', improvementRouter, {
      'grammar': 'fixGrammar',
      'clarity': 'improveClarity',
      'none': 'noImprovement',
    })
    
    // All improvement nodes go to end
    .addEdge('fixGrammar', END)
    .addEdge('improveClarity', END)
    .addEdge('noImprovement', END);

  return graph.compile();
}

/**
 * Creates a graph for finding related notes.
 * Uses AI to analyze content and search for semantically related notes.
 */
export function createFindRelatedGraph() {
  const llm = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0,
  });
  
  // Bind tools to the LLM
  const llmWithTools = llm.bindTools(noteFlowTools);
  
  /**
   * Agent node - analyzes content and decides what to search for
   */
  async function agentNode(state) {
    const { analyzeContent, messages } = state;
    
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant that finds notes related to the given content.

Your task:
1. Analyze the provided content to identify key topics, concepts, and themes
2. Use the search_notes tool to find related notes
3. Make multiple searches if needed to find different aspects of related content

Think about what OTHER notes might be related:
- Similar topics or technologies
- Related projects or meetings
- Connected concepts or themes

Use the search_notes tool with relevant search terms.`,
    };
    
    // Build messages array
    const currentMessages = messages.length === 0
      ? [
          systemMessage,
          {
            role: 'user',
            content: `Find notes related to this content:\n\n${analyzeContent}`,
          },
        ]
      : [systemMessage, ...messages];
    
    const response = await llmWithTools.invoke(currentMessages);
    
    return { messages: [response] };
  }
  
  // Create tool node for automatic tool execution
  const toolNode = new ToolNode(noteFlowTools);
  
  // Build the graph
  const graph = new StateGraph(NoteFlowState)
    .addNode('agent', agentNode)
    .addNode('tools', toolNode)
    .addEdge("__start__", 'agent')
    .addConditionalEdges('agent', toolsCondition)  // Routes to 'tools' or '__end__'
    .addEdge('tools', 'agent')                     // After tools, back to agent
    .compile();
  
  return graph;
}

/**
 * Creates a graph for Smart Search - searching the web.
 * Returns web results packaged as note-like objects.
 */
export function createSmartSearchGraph() {
  const llm = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0,
  });
  
  // Bind web search tool to the LLM
  const llmWithTools = llm.bindTools(webSearchTools);
  
  /**
   * Agent node - processes search query and calls web search
   */
  async function agentNode(state) {
    const { searchQuery, messages } = state;
    
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant that searches the web to find relevant content.

When the user provides a search query:
1. Use the web_search tool to find relevant articles and content
2. The tool will return results formatted as notes

Always use the web_search tool to fulfill the user's request.`,
    };
    
    const currentMessages = messages.length === 0
      ? [
          systemMessage,
          {
            role: 'user',
            content: `Search the web for: ${searchQuery}`,
          },
        ]
      : [systemMessage, ...messages];
    
    const response = await llmWithTools.invoke(currentMessages);
    
    return { messages: [response] };
  }
  
  // Create tool node for web search
  const toolNode = new ToolNode(webSearchTools);
  
  // Build the graph
  const graph = new StateGraph(NoteFlowState)
    .addNode('agent', agentNode)
    .addNode('tools', toolNode)
    .addEdge("__start__", 'agent')
    .addConditionalEdges('agent', toolsCondition)
    .addEdge('tools', 'agent')
    .compile();
  
  return graph;
}
