# NoteFlow - LangGraph.js Course Seed Project

A simple note-taking application that serves as the foundation for learning LangGraph.js. Throughout this course, you'll enhance this app with AI-powered features using LangGraph.js.

## 🎯 Course Purpose

This app starts as a basic CRUD note-taking API. By the end of the course, you'll have added:

- **Smart Summarization** - AI-generated summaries for notes
- **Auto-Tagging** - Intelligent tag suggestions based on content
- **Related Notes** - Find semantically similar notes
- **Natural Language Search** - Search notes using conversational queries
- **Writing Assistance** - Improve and enhance note content

## 🏗️ Project Structure

```
noteflow/
├── public/
│   └── index.html      # Frontend (DO NOT MODIFY)
├── src/
│   ├── index.js        # Express server entry point
│   ├── routes/
│   │   └── notes.js    # Notes API routes
│   └── data/
│       └── notes.js    # In-memory data store
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Or start in production mode
npm start
```

The app will be available at `http://localhost:3000`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes (supports `?search=` and `?tag=` query params) |
| GET | `/api/notes/:id` | Get a single note |
| POST | `/api/notes` | Create a new note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |
| GET | `/api/notes/tags/all` | Get all unique tags |

### Request/Response Examples

**Create a Note:**
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Note",
    "content": "Note content here...",
    "tags": ["work", "important"]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc-123",
    "title": "My Note",
    "content": "Note content here...",
    "tags": ["work", "important"],
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "Note created successfully"
}
```

## 🤖 AI Features (To Be Added)

The frontend already has placeholders for AI features that you'll implement:

1. **Smart Search** - Replace basic text search with semantic search
2. **Auto-suggest Tags** - Generate tag suggestions when creating notes
3. **AI Summary** - Display AI-generated summaries in the view modal
4. **Summarize Button** - Summarize note content on demand
5. **Find Related** - Discover notes related to the current one
6. **Improve Writing** - Enhance note content with AI assistance

## 📚 Course Chapters

1. **Getting Started with LangGraph.js** - Setting up and understanding the basics
2. **Core Concepts: Nodes and Edges** - Building blocks of agent workflows
3. **State Management** - The agent's memory
4. **Working with Tools** - Extending agent capabilities
5. **Project: Task Management Agent** - Building a complete agent from scratch

## ⚠️ Important Notes

- **Do not modify the frontend (`public/index.html`)** - All your work will be on the backend
- The frontend communicates with the API and will automatically reflect backend changes
- The data store is in-memory and resets when the server restarts

## 🛠️ Technologies Used

- **Backend:** Node.js, Express.js
- **Frontend:** HTML, Tailwind CSS (CDN), Vanilla JavaScript
- **Data:** In-memory Map (no database required)

## 📝 License

MIT
