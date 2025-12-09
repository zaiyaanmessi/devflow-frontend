# 📁 Project Structure Guide

## 🎯 What This Project Does

**DevFlow** is a Q&A platform (similar to Stack Overflow) where developers can:
- Ask questions and get answers from the community
- Answer questions and help others
- Vote on questions and answers
- Comment on questions and answers
- Search for questions (both local and from Stack Overflow API)
- Browse questions by tags
- View user profiles and activity
- Manage content based on roles (Student, Expert, Admin)

---

## 📂 Root Directory Structure

```
devflow-frontend/
├── src/                    # Main source code
├── public/                 # Static assets (images, icons)
├── docs/                  # Documentation files
├── node_modules/          # Dependencies (auto-generated)
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── next.config.ts         # Next.js configuration
├── vercel.json            # Vercel deployment configuration
├── eslint.config.mjs      # ESLint configuration
├── postcss.config.mjs     # PostCSS configuration
└── README.md              # Project documentation
```

---

## 📁 `/src` - Main Source Code

This is where all your application code lives.

### `/src/components` - Reusable UI Components

#### `Navbar.tsx`
**Purpose**: Main navigation bar at the top of every page
- Shows user information (username, role)
- Search bar for questions
- Login/Logout buttons
- Links to profile
- **Hidden on**: Login and Register pages

#### `Sidebar.tsx`
**Purpose**: Side navigation menu
- Navigation links (Home, Questions, Tags, Users)
- Search Stack Overflow button
- Only shown when user is logged in
- Appears on most pages (Questions, Profile, Ask, etc.)

#### `/src/components/Profile/` - Profile Display Components

**`StudentProfile.tsx`**
- Displays profile for Student role users
- Shows user info, questions, answers, tags
- Basic profile view

**`ExpertProfile.tsx`**
- Displays profile for Expert role users
- Same as Student but with expert-specific styling/badges

**`AdminProfile.tsx`**
- Displays profile for Admin role users
- Full admin profile view with all features

#### `/src/components/QuestionDetail/` - Question Detail Views

**`StudentView.tsx`**
- Question detail page for Student users
- Shows question, answers, comments
- Can vote, comment, accept answers
- Can edit/delete own content only

**`ExpertView.tsx`**
- Question detail page for Expert users
- All student features PLUS:
  - Can verify answers
  - Can pin questions
  - Can edit/delete any question/answer

**`AdminView.tsx`**
- Question detail page for Admin users
- All expert features PLUS:
  - Full moderation capabilities
  - Can verify/unverify answers
  - Can pin/unpin questions

---

### `/src/pages` - Application Pages (Next.js Routing)

In Next.js, files in the `pages` directory automatically become routes.

#### `_app.tsx`
**Purpose**: Root component that wraps all pages
- Loads global CSS
- Conditionally shows/hides Navbar
- **Routes**: Applies to ALL pages

#### `index.tsx` (Home Page)
**Purpose**: Landing page
- **Route**: `/`
- Automatically redirects to `/questions`
- No content shown (just redirects)

#### `login.tsx`
**Purpose**: User login page
- **Route**: `/login`
- Email and password validation
- Real-time form validation
- Team members and repository links displayed
- Redirects to `/questions` after successful login

#### `register.tsx`
**Purpose**: User registration page
- **Route**: `/register`
- Username, email, password, confirm password
- Real-time form validation
- Creates new user account
- Redirects to `/questions` after successful registration

#### `ask.tsx`
**Purpose**: Page to ask a new question
- **Route**: `/ask`
- Form with title, body (markdown editor), and tags
- Image upload support (with compression)
- Code snippet support
- Creates new question in database

#### `/src/pages/questions/` - Question Pages

**`index.tsx`**
- **Route**: `/questions`
- Lists all questions with pagination
- Filter by tags (via URL query: `?tag=javascript`)
- Search functionality (via URL query: `?search=react`)
- Sort options (newest, popular, trending, unanswered)
- Shows question cards with title, body preview, tags, votes, answers, views

**`[id].tsx`**
- **Route**: `/questions/[id]` (dynamic route)
- Shows full question details
- Displays all answers
- Shows comments for question and answers
- Renders different view based on user role:
  - `StudentView` for students
  - `ExpertView` for experts
  - `AdminView` for admins
- Handles voting, commenting, accepting answers
- Handles editing/deleting questions and answers

#### `/src/pages/profile/` - Profile Pages

**`index.tsx`**
- **Route**: `/profile`
- Redirects to current user's profile
- Gets user ID from localStorage

**`[id].tsx`**
- **Route**: `/profile/[id]` (dynamic route)
- Shows user profile page
- Displays user information, questions, answers, tags
- Tabs: Summary, Answers, Questions, Tags, Activity, Settings
- Edit profile functionality
- Role change (if own profile)
- Renders different profile component based on role

#### `search.tsx`
**Purpose**: Search Stack Overflow questions
- **Route**: `/search`
- Searches Stack Overflow API (external)
- Displays results from Stack Overflow
- Debounced search (waits for user to stop typing)
- Rate limiting to prevent API abuse

#### `/src/pages/tags/` - Tag Pages

**`index.tsx`**
- **Route**: `/tags`
- Lists all tags used in questions
- Shows tag name and question count
- Clicking a tag goes to `/questions?tag=tagName`
- Search and sort tags

#### `/src/pages/users/` - User Pages

**`index.tsx`**
- **Route**: `/users`
- Lists all users in the system
- Shows username, role, question count, answer count
- Search and sort users
- Clicking a user goes to their profile

---

### `/src/services` - API Service Layer

#### `api.ts`
**Purpose**: Main API service for backend communication
- Centralized API client using Axios
- JWT token handling (auto-adds to requests)
- All backend API endpoints:
  - **Auth**: register, login, getMe
  - **Questions**: getAll, getById, create, update, delete, search
  - **Answers**: create, accept
  - **Votes**: create, delete
  - **Comments**: create
  - **Users**: getProfile, updateProfile, getQuestions
- Base URL from environment variable: `NEXT_PUBLIC_API_URL`

#### `stackoverflowApi.ts`
**Purpose**: Stack Overflow API integration
- Searches Stack Overflow questions
- Rate limiting and backoff mechanisms
- TypeScript types for Stack Overflow data
- Error handling
- Used by `/search` page

---

### `/src/hooks` - Custom React Hooks

#### `useDebounce.ts`
**Purpose**: Debounce hook for search functionality
- Delays value updates until user stops typing
- Prevents excessive API calls
- Used in search pages
- Example: Waits 500ms after user stops typing before searching

---

### `/src/types` - TypeScript Type Definitions

#### `index.ts`
**Purpose**: Shared TypeScript interfaces/types
- **User**: User data structure (id, username, email, role, etc.)
- **Question**: Question data structure (id, title, body, tags, votes, etc.)
- **Answer**: Answer data structure (id, body, answerer, votes, isAccepted, etc.)
- **Vote**: Vote data structure (id, user, targetType, targetId, value)
- **Comment**: Comment data structure (id, body, author, targetType, targetId)
- Used throughout the app for type safety

---

### `/src/styles` - Global Styles

#### `global.css`
**Purpose**: Global CSS and Tailwind styles
- Tailwind CSS configuration
- Custom CSS classes for components
- Login/Register page styles
- Question detail page styles
- Profile page styles
- Responsive design styles
- Dark theme colors and styling
- All component-specific styles

---

## 📁 `/public` - Static Assets

**Purpose**: Files served directly (not processed)
- `favicon.ico` - Browser tab icon
- SVG files - Next.js default icons (can be removed if not used)

---

## 📁 `/docs` - Documentation

#### `Design.md`
**Purpose**: UML class diagram and data model documentation
- Shows database schema
- Entity relationships
- Used for project documentation

---

## ⚙️ Configuration Files

### `package.json`
**Purpose**: Project metadata and dependencies
- Lists all npm packages used
- Defines scripts: `dev`, `build`, `start`, `lint`
- Project name, version

### `tsconfig.json`
**Purpose**: TypeScript compiler configuration
- TypeScript settings
- Path aliases (`@/` points to `src/`)
- Compilation options

### `next.config.ts`
**Purpose**: Next.js framework configuration
- Next.js specific settings
- Build optimizations
- Output mode (standalone for production)

### `vercel.json`
**Purpose**: Vercel deployment configuration
- Build commands
- Framework detection
- Region settings

### `eslint.config.mjs`
**Purpose**: Code linting rules
- ESLint configuration
- Code quality rules
- TypeScript linting rules

### `postcss.config.mjs`
**Purpose**: PostCSS configuration
- Processes CSS
- Tailwind CSS integration

---

## 🔄 How Files Connect Together

### Example Flow: Viewing a Question

1. **User clicks question** → `/questions/[id]` page loads
2. **`[id].tsx`** fetches question data using `api.ts` service
3. **`[id].tsx`** checks user role from localStorage
4. **`[id].tsx`** renders appropriate view component:
   - Student → `StudentView.tsx`
   - Expert → `ExpertView.tsx`
   - Admin → `AdminView.tsx`
5. **View component** displays question, answers, comments
6. **User actions** (vote, comment) → calls `api.ts` → updates database → refreshes UI

### Example Flow: Asking a Question

1. **User navigates** to `/ask` page
2. **`ask.tsx`** renders form with markdown editor
3. **User submits** → `ask.tsx` calls `api.ts` → `questionAPI.create()`
4. **Backend creates question** → returns question data
5. **Redirects** to `/questions/[newQuestionId]`

### Example Flow: User Authentication

1. **User visits** `/login` page
2. **Fills form** → `login.tsx` validates input
3. **Submits** → calls `api.ts` → `authAPI.login()`
4. **Backend validates** → returns JWT token and user data
5. **Token stored** in localStorage
6. **User data stored** in localStorage
7. **Redirects** to `/questions`
8. **Navbar** reads from localStorage → shows user info

---

## 🎨 Component Hierarchy

```
_app.tsx (Root)
├── Navbar.tsx (if not login/register)
└── Page Component
    ├── Sidebar.tsx (if logged in)
    └── Page Content
        └── Various Components
```

### Question Detail Page Structure:
```
questions/[id].tsx
├── Fetches question data
├── Determines user role
└── Renders:
    ├── StudentView.tsx OR
    ├── ExpertView.tsx OR
    └── AdminView.tsx
        ├── Question display
        ├── Answers list
        ├── Comments
        └── Action buttons (vote, comment, edit, delete)
```

---

## 🔐 Role-Based Access Control

### Student
- Can: Ask, answer, vote, comment, edit/delete own content
- Files: `StudentView.tsx`, `StudentProfile.tsx`

### Expert
- Can: Everything Student can + verify answers, pin questions, edit/delete any content
- Files: `ExpertView.tsx`, `ExpertProfile.tsx`

### Admin
- Can: Everything Expert can + full moderation
- Files: `AdminView.tsx`, `AdminProfile.tsx`

---

## 📡 API Communication Flow

```
Component (e.g., questions/[id].tsx)
    ↓
Service Layer (api.ts)
    ↓
Axios HTTP Request
    ↓
Backend API (external server)
    ↓
Response
    ↓
Service Layer processes
    ↓
Component updates state
    ↓
UI re-renders
```

---

## 🗂️ Data Flow

1. **User Action** (click, submit, etc.)
2. **Component Handler** (e.g., `handleVote`)
3. **API Call** (via `api.ts`)
4. **Backend Processing**
5. **Response Received**
6. **State Update** (React `setState`)
7. **UI Re-render** (React updates DOM)

---

## 🎯 Key Concepts

### Next.js Routing
- Files in `pages/` = routes
- `index.tsx` = `/` route
- `[id].tsx` = dynamic route (e.g., `/questions/123`)
- `_app.tsx` = wraps all pages

### State Management
- React `useState` for local component state
- `localStorage` for persistent data (user, token)
- No global state management library (Redux, Zustand, etc.)

### Authentication
- JWT tokens stored in `localStorage`
- Token added to all API requests via Axios interceptor
- User data stored in `localStorage`
- No automatic logout on 401 (components handle it)

### Styling
- Tailwind CSS for utility classes
- Custom CSS classes in `global.css`
- Dark theme throughout
- Responsive design (mobile, tablet, desktop)

---

## 📝 Quick Reference

| File/Folder | Purpose | Key Function |
|------------|---------|--------------|
| `Navbar.tsx` | Top navigation | User info, search, logout |
| `Sidebar.tsx` | Side navigation | Links to pages |
| `api.ts` | Backend API | All HTTP requests |
| `_app.tsx` | Root wrapper | Global setup |
| `questions/[id].tsx` | Question detail | Main question page logic |
| `StudentView.tsx` | Student UI | Student-specific features |
| `ExpertView.tsx` | Expert UI | Expert-specific features |
| `AdminView.tsx` | Admin UI | Admin-specific features |
| `global.css` | All styles | Component styling |
| `types/index.ts` | TypeScript types | Data structures |

---

## 🚀 Getting Started Reading the Code

1. **Start with**: `_app.tsx` - Understand the app structure
2. **Then**: `index.tsx` - See how routing works
3. **Then**: `login.tsx` - Understand authentication flow
4. **Then**: `api.ts` - See how data is fetched
5. **Then**: `questions/[id].tsx` - See main feature implementation
6. **Then**: Component files - Understand UI components

---

This guide should help you navigate and understand the entire codebase! 🎉

