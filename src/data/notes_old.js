// In-memory data store for notes
// In a real app, this would be a database

const notes = new Map();

// Seed some initial notes for demonstration
const seedNotes = [
  {
    id: '1',
    title: 'Welcome to NoteFlow',
    content: 'This is your first note! NoteFlow is a simple note-taking app that will be enhanced with AI capabilities using LangGraph.js.',
    tags: ['welcome', 'getting-started'],
    createdAt: new Date('2024-01-15T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-15T10:00:00Z').toISOString()
  },
  {
    id: '2',
    title: 'Meeting Notes - Project Kickoff',
    content: 'Discussed the new project timeline. Key milestones: Phase 1 due March 15, Phase 2 due May 30. Team members assigned: Sarah (frontend), Mike (backend), Lisa (design). Need to follow up on budget approval.',
    tags: ['meeting', 'project'],
    createdAt: new Date('2024-01-16T14:30:00Z').toISOString(),
    updatedAt: new Date('2024-01-16T14:30:00Z').toISOString()
  },
  {
    id: '3',
    title: 'JavaScript Tips',
    content: 'Remember to use const and let instead of var. Arrow functions are great for callbacks. Async/await makes asynchronous code much cleaner than callbacks or raw promises.',
    tags: ['coding', 'javascript'],
    createdAt: new Date('2024-01-17T09:15:00Z').toISOString(),
    updatedAt: new Date('2024-01-17T09:15:00Z').toISOString()
  }
];

// Initialize with seed data
seedNotes.forEach(note => notes.set(note.id, note));

export default notes;
