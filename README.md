# TalentFlow - Mini Hiring Platform

A React-based hiring platform that allows HR teams to manage jobs, candidates, and assessments without a backend server.

## Features

### Jobs Management
- ✅ Create, edit, and archive jobs
- ✅ Server-like pagination and filtering
- ✅ Drag-and-drop reordering with optimistic updates
- ✅ Deep linking to individual jobs
- ✅ Form validation and unique slug generation

### Candidates Management
- ✅ Virtualized list for 1000+ candidates
- ✅ Client-side search by name/email
- ✅ Server-like filtering by stage
- ✅ Kanban board with drag-and-drop stage transitions
- ✅ Candidate profile pages with timeline
- ✅ Notes with @mentions support

### Assessments
- ✅ Assessment builder with multiple question types
- ✅ Live preview pane
- ✅ Form validation and conditional questions
- ✅ Local persistence of builder state and responses

## Tech Stack

- **Frontend**: React 18, React Router, React Query
- **UI**: Custom CSS with responsive design
- **State Management**: Zustand + React Query
- **Drag & Drop**: @dnd-kit
- **Virtualization**: react-window
- **Mock API**: MSW (Mock Service Worker)
- **Local Storage**: Dexie (IndexedDB wrapper)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Architecture

### Data Flow
```
UI Components → React Query → MSW Handlers → IndexedDB (via Dexie)
```

### Key Design Decisions

1. **MSW for API Simulation**: Provides realistic network behavior with configurable latency and error rates
2. **IndexedDB for Persistence**: All data persists locally across browser sessions
3. **React Query for State Management**: Handles caching, background updates, and optimistic updates
4. **Virtualization**: Handles large candidate lists efficiently
5. **Optimistic Updates**: Immediate UI feedback with rollback on failure

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Route components
├── mocks/              # MSW handlers and seed data
├── db/                 # IndexedDB setup
├── types/              # TypeScript definitions
└── utils/              # Helper functions
```

## API Endpoints (Simulated)

### Jobs
- `GET /api/jobs` - List jobs with pagination/filtering
- `POST /api/jobs` - Create new job
- `PATCH /api/jobs/:id` - Update job
- `PATCH /api/jobs/:id/reorder` - Reorder jobs

### Candidates
- `GET /api/candidates` - List candidates with pagination/filtering
- `PATCH /api/candidates/:id` - Update candidate (stage changes)
- `GET /api/candidates/:id/timeline` - Get candidate timeline

### Assessments
- `GET /api/assessments/:jobId` - Get assessment for job
- `PUT /api/assessments/:jobId` - Create/update assessment
- `POST /api/assessments/:jobId/submit` - Submit assessment response

## Seed Data

- 25 jobs (mixed active/archived)
- 1,000 candidates across different stages
- 3 sample assessments with 10+ questions each
- Realistic timeline events and stage transitions

## Error Handling

- 5-10% error rate on write operations
- Optimistic updates with automatic rollback
- User-friendly error messages
- Network latency simulation (200-1200ms)

## Performance Features

- Virtualized candidate list for smooth scrolling
- Debounced search inputs
- Optimistic updates for immediate feedback
- Efficient re-rendering with React Query

## Browser Support

- Modern browsers with ES6+ support
- IndexedDB support required
- Responsive design for mobile/tablet

## Known Issues

- File upload is stubbed (no actual file handling)
- @mentions are visual only (no user lookup)
- Assessment conditional logic is basic
- No real-time collaboration features

## Future Enhancements

- Real backend integration
- Advanced assessment logic
- Email notifications
- Bulk operations
- Advanced reporting
- Role-based permissions