import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getAllNotes } from '../data/notes.js';

import { tavily } from '@tavily/core'; 

// Initialize Tavily client                        
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

/**
 * Tool for searching through the user's notes.
 * Returns JSON so the API can extract note objects.
 */
export const searchNotesTool = tool(
  async ({ query, limit }) => {

    const maxResults = limit ?? 5;

    const notes = getAllNotes();
    const searchLower = query.toLowerCase();
    
    // Search in title, content, and tags
    const matchingNotes = notes
      .filter(note =>
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
      .slice(0, maxResults);
    
    // Return JSON so API can extract note objects
    return JSON.stringify({
      found: matchingNotes.length,
      notes: matchingNotes,
    });
  },
  {
    name: 'search_notes',
    description: `Search through the user's notes by keyword, topic, or phrase. 
Use this to find notes related to specific concepts, projects, or themes.
Returns matching notes with their full content.`,
    schema: z.object({
      query: z.string().describe('Search terms to find in notes'),
      limit: z.number().min(1).max(10).describe('Maximum notes to return'),
    }),
  }
);

/**
 * Tool for searching the web using Tavily.
 * Returns results formatted as note-like objects.
 */
export const webSearchTool = tool(
  async ({ query, maxResults }) => {

    const limit = maxResults ?? 5;

    try {
      const response = await tavilyClient.search(query, {
        maxResults,
        searchDepth: 'basic',
        includeAnswer: false,
      });
      
      // Transform Tavily results into note-like objects
      const webNotes = response.results.map((result, index) => ({
        id: `web-${Date.now()}-${index}`,
        title: result.title || 'Untitled',
        content: result.content || result.snippet || 'No content available',
        tags: ['web-result'],
        url: result.url,
        source: new URL(result.url).hostname,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      return JSON.stringify({
        found: webNotes.length,
        notes: webNotes,
      });
    } catch (error) {
      console.error('Tavily search error:', error);
      return JSON.stringify({
        found: 0,
        notes: [],
        error: 'Web search failed',
      });
    }
  },
  {
    name: 'web_search',
    description: `Search the web for information on any topic. 
Use this to find articles, blog posts, documentation, and other web content.
Returns results formatted as notes with title, content, and source URL.`,
    schema: z.object({
      query: z.string().describe('Search query to find on the web'),
      maxResults: z.number().min(1).max(10).describe('Maximum results to return'),
    }),
  }
);

// Export all tools as an array for easy binding
export const noteFlowTools = [searchNotesTool];
export const webSearchTools = [webSearchTool];