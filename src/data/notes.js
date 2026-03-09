// In-memory data store for notes
// In a real app, this would be a database

const notes = new Map();

// Seed data with related note clusters for testing Find Related
const seedNotes = [
  // ═══════════════════════════════════════════════════════════
  // CLUSTER 1: React & Frontend Development
  // ═══════════════════════════════════════════════════════════
  {
    id: '1',
    title: 'React Hooks Best Practices',
    content: `Notes from my research on React hooks:
1. Always call hooks at the top level
2. Use useCallback for functions passed to child components
3. useMemo for expensive calculations
4. Custom hooks should start with "use" prefix
Remember: hooks cannot be called conditionally!`,
    tags: ['react', 'javascript', 'programming'],
    createdAt: new Date('2024-10-18').toISOString(),
    updatedAt: new Date('2024-10-18').toISOString(),
  },
  {
    id: '2',
    title: 'JavaScript Performance Tips',
    content: `Key performance optimizations for JavaScript apps:
- Debounce expensive event handlers
- Use requestAnimationFrame for smooth animations
- Lazy load components and routes
- Memoize pure functions with useMemo and useCallback
- Avoid unnecessary re-renders in React
Profile before optimizing - measure, don't guess!`,
    tags: ['javascript', 'performance', 'react'],
    createdAt: new Date('2024-10-25').toISOString(),
    updatedAt: new Date('2024-10-25').toISOString(),
  },
  {
    id: '3',
    title: 'Frontend Architecture Decisions',
    content: `Decisions for the new dashboard project:
- Using React with TypeScript for type safety
- State management: Zustand over Redux (simpler API)
- Styling: Tailwind CSS for rapid development
- Testing: Vitest + React Testing Library
- Build tool: Vite for faster dev experience
Need to document component patterns for the team.`,
    tags: ['architecture', 'react', 'frontend'],
    createdAt: new Date('2024-11-01').toISOString(),
    updatedAt: new Date('2024-11-01').toISOString(),
  },

  // ═══════════════════════════════════════════════════════════
  // CLUSTER 2: Budget & Financial Planning
  // ═══════════════════════════════════════════════════════════
  {
    id: '4',
    title: 'Q3 Budget Planning Meeting',
    content: `Discussed the quarterly budget allocation for Q3. Key decisions:
- Marketing budget increased by 15% for the new campaign
- Engineering headcount approved for 3 new positions
- Travel budget reduced due to remote work policy
- Software licenses need renewal: $12,000 allocated
Action items: Sarah to prepare detailed breakdown by Friday.`,
    tags: ['meeting', 'budget', 'q3'],
    createdAt: new Date('2024-10-15').toISOString(),
    updatedAt: new Date('2024-10-15').toISOString(),
  },
  {
    id: '5',
    title: 'Q4 Sales Projections',
    content: `Q4 revenue projections based on current pipeline:
- Confirmed deals: $120,000
- High probability (>75%): $85,000
- Medium probability (50-75%): $45,000
- Total projected: $200,000 - $250,000
Key risks: Two large deals pending legal review.
Need to align with Q3 budget actuals before finalizing.`,
    tags: ['sales', 'budget', 'q4'],
    createdAt: new Date('2024-11-05').toISOString(),
    updatedAt: new Date('2024-11-05').toISOString(),
  },
  {
    id: '6',
    title: 'Annual Budget Review Notes',
    content: `Reviewed full year financials with CFO:
- Q1-Q3 spending was 8% under budget
- Engineering costs higher than expected (new hires)
- Marketing ROI improved 23% vs last year
- Q4 forecast looks strong based on sales pipeline
Recommendation: Reallocate Q3 savings to Q4 marketing push.`,
    tags: ['budget', 'finance', 'annual-review'],
    createdAt: new Date('2024-11-10').toISOString(),
    updatedAt: new Date('2024-11-10').toISOString(),
  },

  // ═══════════════════════════════════════════════════════════
  // CLUSTER 3: Project Phoenix (Microservices Migration)
  // ═══════════════════════════════════════════════════════════
  {
    id: '7',
    title: 'Project Phoenix Kickoff',
    content: `New project starting next month. Goals:
- Migrate legacy monolith to microservices
- Improve API response time by 50%
- Implement real-time notifications
Team: John (lead), Maria, Dev, and myself
Timeline: 6 months with monthly milestones
First milestone: Authentication service extraction.`,
    tags: ['project', 'phoenix', 'microservices'],
    createdAt: new Date('2024-10-20').toISOString(),
    updatedAt: new Date('2024-10-20').toISOString(),
  },
  {
    id: '8',
    title: 'Phoenix: API Gateway Research',
    content: `Researching API gateway options for Project Phoenix:
- Kong: Most features, steeper learning curve
- AWS API Gateway: Good if staying in AWS ecosystem
- Express Gateway: Lightweight, Node.js native
Recommendation: Start with Express Gateway for MVP, 
migrate to Kong if we need advanced features.
Need to discuss with John before finalizing.`,
    tags: ['phoenix', 'api', 'research'],
    createdAt: new Date('2024-10-28').toISOString(),
    updatedAt: new Date('2024-10-28').toISOString(),
  },
  {
    id: '9',
    title: 'Phoenix Sprint 1 Retrospective',
    content: `Sprint 1 completed for Project Phoenix:
What went well:
- Auth service extracted successfully
- Team collaboration was excellent
- CI/CD pipeline set up early
What to improve:
- Better documentation needed
- API response times still not meeting target
- Need more testing coverage
Action: Schedule knowledge sharing session on microservices patterns.`,
    tags: ['phoenix', 'retrospective', 'sprint'],
    createdAt: new Date('2024-11-15').toISOString(),
    updatedAt: new Date('2024-11-15').toISOString(),
  },

  // ═══════════════════════════════════════════════════════════
  // CLUSTER 4: Client Work & Sales
  // ═══════════════════════════════════════════════════════════
  {
    id: '10',
    title: 'Client Meeting: Acme Corp',
    content: `Met with Acme Corp to discuss their requirements:
- Need a customer portal by end of Q4
- Integration with their existing CRM (Salesforce)
- Mobile-responsive design is mandatory
- Budget: $50,000 - $75,000 range
Follow-up: Send proposal by next Wednesday.
Contact: Jennifer Adams, VP of Operations.`,
    tags: ['meeting', 'client', 'acme'],
    createdAt: new Date('2024-10-28').toISOString(),
    updatedAt: new Date('2024-10-28').toISOString(),
  },
  {
    id: '11',
    title: 'Acme Corp Proposal Draft',
    content: `Proposal outline for Acme customer portal:
Phase 1 (6 weeks): Core portal + user authentication
Phase 2 (4 weeks): Salesforce CRM integration
Phase 3 (2 weeks): Mobile optimization + testing
Total estimate: $62,000
Includes: 3 months post-launch support
Risk: Salesforce API complexity might extend Phase 2.
Need to review with sales team before sending.`,
    tags: ['proposal', 'client', 'acme'],
    createdAt: new Date('2024-11-02').toISOString(),
    updatedAt: new Date('2024-11-02').toISOString(),
  },
  {
    id: '12',
    title: 'Acme Corp - Contract Signed!',
    content: `Great news - Acme Corp signed the contract today!
Final agreed terms:
- Total value: $58,000 (negotiated down from $62k)
- Timeline: 12 weeks starting Dec 1st
- Payment: 40% upfront, 40% mid-project, 20% completion
Jennifer confirmed she'll be our main point of contact.
Kickoff meeting scheduled for Monday.`,
    tags: ['client', 'acme', 'sales'],
    createdAt: new Date('2024-11-20').toISOString(),
    updatedAt: new Date('2024-11-20').toISOString(),
  },

  // ═══════════════════════════════════════════════════════════
  // CLUSTER 5: Team & Meetings
  // ═══════════════════════════════════════════════════════════
  {
    id: '13',
    title: 'Weekly Team Standup Notes',
    content: `This week's standup summary:
- Frontend team finished the dashboard redesign
- Backend API optimization reduced response times by 30%
- QA found 3 critical bugs, all now fixed
- Next sprint planning scheduled for Monday
Blockers: Waiting on design approval for mobile layouts.
Maria out next week - need coverage for Phoenix tasks.`,
    tags: ['meeting', 'standup', 'team'],
    createdAt: new Date('2024-10-22').toISOString(),
    updatedAt: new Date('2024-10-22').toISOString(),
  },
  {
    id: '14',
    title: 'Team Offsite Planning',
    content: `Planning Q1 team offsite:
Date options: Jan 15-16 or Jan 22-23
Location ideas: Mountain retreat or downtown hotel
Agenda items:
- 2025 roadmap review
- Team building activities
- Technical skill workshops
- Individual career discussions
Budget approved: $5,000 (from Q3 savings)
Send survey to team for date preference.`,
    tags: ['team', 'planning', 'offsite'],
    createdAt: new Date('2024-11-12').toISOString(),
    updatedAt: new Date('2024-11-12').toISOString(),
  },

  // ═══════════════════════════════════════════════════════════
  // STANDALONE: Welcome Note
  // ═══════════════════════════════════════════════════════════
  {
    id: '15',
    title: 'Welcome to NoteFlow',
    content: 'This is your first note! NoteFlow helps you organize your thoughts with AI-powered features like summarization, tag suggestions, and finding related notes.',
    tags: ['welcome', 'getting-started'],
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
];

// Initialize with seed data
seedNotes.forEach(note => notes.set(note.id, note));

// Helper function for AI tools to access all notes
export function getAllNotes() {
  return Array.from(notes.values());
}

export default notes;