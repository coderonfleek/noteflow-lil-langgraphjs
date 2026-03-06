import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import notes from '../data/notes.js';

const router = Router();

// GET /api/notes - Get all notes
router.get('/', (req, res) => {
  const { search, tag } = req.query;
  let allNotes = Array.from(notes.values());
  
  // Filter by search term (searches title and content)
  if (search) {
    const searchLower = search.toLowerCase();
    allNotes = allNotes.filter(note => 
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower)
    );
  }
  
  // Filter by tag
  if (tag) {
    allNotes = allNotes.filter(note => 
      note.tags.includes(tag.toLowerCase())
    );
  }
  
  // Sort by updatedAt (most recent first)
  allNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  
  res.json({
    success: true,
    data: allNotes,
    count: allNotes.length
  });
});

// GET /api/notes/tags/all - Get all unique tags
// NOTE: This route MUST be before /:id to avoid conflicts
router.get('/tags/all', (req, res) => {
  const allTags = new Set();
  
  notes.forEach(note => {
    note.tags.forEach(tag => allTags.add(tag));
  });
  
  res.json({
    success: true,
    data: Array.from(allTags).sort()
  });
});

// GET /api/notes/:id - Get a single note
router.get('/:id', (req, res) => {
  const note = notes.get(req.params.id);
  
  if (!note) {
    return res.status(404).json({
      success: false,
      error: 'Note not found'
    });
  }
  
  res.json({
    success: true,
    data: note
  });
});

// POST /api/notes - Create a new note
router.post('/', (req, res) => {
  const { title, content, tags = [] } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({
      success: false,
      error: 'Title and content are required'
    });
  }
  
  const now = new Date().toISOString();
  const note = {
    id: uuidv4(),
    title: title.trim(),
    content: content.trim(),
    tags: tags.map(tag => tag.toLowerCase().trim()).filter(Boolean),
    createdAt: now,
    updatedAt: now
  };
  
  notes.set(note.id, note);
  
  res.status(201).json({
    success: true,
    data: note,
    message: 'Note created successfully'
  });
});

// PUT /api/notes/:id - Update a note
router.put('/:id', (req, res) => {
  const existingNote = notes.get(req.params.id);
  
  if (!existingNote) {
    return res.status(404).json({
      success: false,
      error: 'Note not found'
    });
  }
  
  const { title, content, tags } = req.body;
  
  const updatedNote = {
    ...existingNote,
    title: title?.trim() || existingNote.title,
    content: content?.trim() || existingNote.content,
    tags: tags ? tags.map(tag => tag.toLowerCase().trim()).filter(Boolean) : existingNote.tags,
    updatedAt: new Date().toISOString()
  };
  
  notes.set(req.params.id, updatedNote);
  
  res.json({
    success: true,
    data: updatedNote,
    message: 'Note updated successfully'
  });
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', (req, res) => {
  if (!notes.has(req.params.id)) {
    return res.status(404).json({
      success: false,
      error: 'Note not found'
    });
  }
  
  notes.delete(req.params.id);
  
  res.json({
    success: true,
    message: 'Note deleted successfully'
  });
});

export default router;
