// src/routes/ai.js

import { Router } from 'express';
import { 
  createSummarizeGraph, 
  createSuggestTagsGraph,
  createImproveWritingGraph,
  createFindRelatedGraph,
  createSmartSearchGraph
} from '../agent/graph.js';

const router = Router();

// Create the graph once when the server starts
const summarizeGraph = createSummarizeGraph();
const suggestTagsGraph = createSuggestTagsGraph();
const improveWritingGraph = createImproveWritingGraph();

/**
 * POST /api/ai/summarize
 * 
 * Generates a summary of the provided content.
 * 
 * Request:  { content: string }
 * Response: { success: boolean, data: { summary: string } }
 */
router.post('/summarize', async (req, res) => {
  try {
    const { content } = req.body;

    // Validate input
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    // Run the graph
    const result = await summarizeGraph.invoke({
      noteContent: content,
    });

    // Return the summary
    res.json({
      success: true,
      data: {
        summary: result.summary,
      },
    });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary',
    });
  }
});

/**
 * POST /api/ai/suggest-tags
 *
 * Generates tag suggestions for a note.
 */
router.post('/suggest-tags', async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    const result = await suggestTagsGraph.invoke({
      noteContent: content,
      noteTitle: title || '',
    });

    res.json({
      success: true,
      data: {
        tags: result.suggestedTags,
      },
    });
  } catch (error) {
    console.error('Suggest tags error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to suggest tags',
    });
  }
});

/**
 * POST /api/ai/improve-writing
 *
 * Analyzes and improves the writing in the provided content.
 * Uses conditional routing to apply the most appropriate improvement.
 */
router.post('/improve-writing', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    const result = await improveWritingGraph.invoke({
      noteContent: content,
    });

    res.json({
      success: true,
      data: {
        improved: result.improvedContent,
        improvementType: result.improvementType,
      },
    });
  } catch (error) {
    console.error('Improve writing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to improve writing',
    });
  }
});

/**
 * POST /api/ai/find-related
 * Find notes related to the given content
 */
router.post('/find-related', async (req, res) => {
  try {
    const { content, excludeId } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }
    
    // Create and run the graph
    const graph = createFindRelatedGraph();
    const result = await graph.invoke({
      analyzeContent: content,
    });
    
    // Extract notes from tool results
    let relatedNotes = [];
    
    for (const message of result.messages) {
      if (message._getType() === 'tool') {
        try {
          const toolResult = JSON.parse(message.content);
          if (toolResult.notes && Array.isArray(toolResult.notes)) {
            // Add notes, avoiding duplicates
            for (const note of toolResult.notes) {
              if (!relatedNotes.find(n => n.id === note.id)) {
                relatedNotes.push(note);
              }
            }
          }
        } catch (e) {
          // Skip if not valid JSON
        }
      }
    }
    
    // Filter out the current note if excludeId provided
    if (excludeId) {
      relatedNotes = relatedNotes.filter(note => note.id !== excludeId);
    }
    
    res.json({
      success: true,
      data: {
        notes: relatedNotes,
      },
    });
    
  } catch (error) {
    console.error('Find related error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find related notes',
    });
  }
});

/**
 * GET /api/ai/smart-search
 * Search the web and return results as note-like objects
 */
router.get('/smart-search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query (q) is required',
      });
    }
    
    // Create and run the graph
    const graph = createSmartSearchGraph();
    const result = await graph.invoke({
      searchQuery: q,
    });
    
    // Extract web notes from tool results
    let webNotes = [];
    
    for (const message of result.messages) {
      if (message._getType() === 'tool') {
        try {
          const toolResult = JSON.parse(message.content);
          if (toolResult.notes && Array.isArray(toolResult.notes)) {
            webNotes = toolResult.notes;
          }
        } catch (e) {
          // Skip if not valid JSON
        }
      }
    }
    
    res.json({
      success: true,
      data: webNotes,
    });
    
  } catch (error) {
    console.error('Smart search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform smart search',
    });
  }
});

export default router;