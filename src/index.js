// Load environment variables FIRST (before other imports)
import 'dotenv/config';

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import notesRouter from './routes/notes.js';
import aiRouter from './routes/ai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '../public')));

// API Routes
app.use('/api/notes', notesRouter);
app.use('/api/ai', aiRouter);

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 NoteFlow server running at http://localhost:${PORT}`);
});
