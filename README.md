# 🚀 DevFlow - Q&A Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)

**A modern, full-featured Q&A platform inspired by Stack Overflow, built with Next.js and TypeScript.**

[Features](#-features) • [Installation](#-installation) • [Documentation](#-documentation) • [Deployment](#-deployment)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Integration](#-api-integration)
- [Role-Based Access Control](#-role-based-access-control)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

DevFlow is a comprehensive question-and-answer platform that enables developers to ask questions, share knowledge, and build their reputation within the community. The platform features role-based access control, real-time interactions, and a modern, responsive design.

### Key Highlights

- ✨ **Modern UI/UX** - Beautiful dark theme with smooth animations
- 🔐 **Role-Based Access** - Student, Expert, and Admin roles with distinct permissions
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- 🚀 **Performance Optimized** - Built with Next.js for optimal performance
- 🔍 **Advanced Search** - Search local questions and Stack Overflow API integration
- 💬 **Real-Time Interactions** - Comments, votes, and answer acceptance
- 🏷️ **Tag System** - Organize questions with tags and filter by them

---

## ✨ Features

### Core Functionality

- **Question Management**
  - Ask questions with markdown support
  - Edit and delete your own questions
  - View question details with answers and comments
  - Filter questions by tags, search, and sort options

- **Answer System**
  - Provide detailed answers with markdown formatting
  - Accept answers as the question asker
  - Vote on questions and answers
  - Edit and delete your own answers

- **User Profiles**
  - Comprehensive user profiles with activity history
  - View questions, answers, and tags
  - Edit profile information
  - Role-based profile views

- **Tag Management**
  - Browse all tags with usage statistics
  - Filter questions by specific tags
  - Click tags to view related questions

- **Search & Discovery**
  - Search local project questions
  - Search Stack Overflow API
  - Advanced filtering and sorting

### Role-Based Features

#### 👨‍🎓 Student Role
- Ask and answer questions
- Vote on content
- Comment on questions and answers
- Edit/delete own content

#### 👨‍🏫 Expert Role
- All student features
- Verify answers
- Pin important questions
- Edit/delete any question or answer

#### 👨‍💼 Admin Role
- All expert features
- Full moderation capabilities
- Manage all content
- System administration

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) - React framework with SSR/SSG
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **HTTP Client**: [Axios](https://axios-http.com/) - Promise-based HTTP client
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) - Popular icon library

### Architecture
- **Component-Based**: Modular React components
- **Service Layer**: Centralized API service layer
- **Type Safety**: Full TypeScript coverage
- **State Management**: React hooks and local state
- **Routing**: Next.js file-based routing

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Git** for version control
- Backend API server running (see [Backend Deployment](./BACKEND_DEPLOYMENT.md))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zaiyaanmessi/devflow-frontend.git
   cd devflow-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
   
   For production, use your deployed backend URL:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
devflow-frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Navbar.tsx       # Main navigation bar
│   │   ├── Sidebar.tsx      # Side navigation
│   │   ├── Profile/         # Profile components
│   │   └── QuestionDetail/ # Question detail views
│   ├── pages/               # Next.js pages (routing)
│   │   ├── index.tsx        # Home page
│   │   ├── questions/       # Question pages
│   │   ├── profile/         # Profile pages
│   │   ├── ask.tsx          # Ask question page
│   │   ├── login.tsx        # Login page
│   │   └── register.tsx     # Registration page
│   ├── services/            # API service layer
│   │   ├── api.ts           # Main API service
│   │   └── stackoverflowApi.ts  # Stack Overflow API
│   ├── hooks/                # Custom React hooks
│   │   └── useDebounce.ts   # Debounce hook
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts         # Shared types
│   └── styles/              # Global styles
│       └── global.css       # Global CSS and Tailwind
├── public/                   # Static assets
├── docs/                     # Documentation
│   └── Design.md            # UML class diagram
├── Design.md                 # Design documentation
├── DEPLOYMENT.md             # Deployment guide
├── BACKEND_DEPLOYMENT.md     # Backend deployment guide
├── ROLE_PERMISSIONS.md       # Role permissions documentation
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json              # Project dependencies
```

---

## 🔌 API Integration

### Backend API

The frontend communicates with a RESTful backend API. All API calls are centralized in `src/services/api.ts`.

**Base URL**: Configured via `NEXT_PUBLIC_API_URL` environment variable

### Available Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Questions
- `GET /api/questions` - Get all questions (with pagination, search, tags)
- `GET /api/questions/:id` - Get question by ID
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

#### Answers
- `POST /api/questions/:id/answers` - Create answer
- `PUT /api/questions/:id/answers/:answerId/accept` - Accept answer

#### Votes
- `POST /api/votes` - Create vote
- `DELETE /api/votes/:id` - Delete vote

#### Comments
- `POST /api/comments` - Create comment

#### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/questions` - Get user's questions

### Stack Overflow API Integration

The platform also integrates with the Stack Overflow API for searching external questions. See `src/services/stackoverflowApi.ts` for implementation details.

---

## 🔐 Role-Based Access Control

The platform implements three user roles with distinct permissions:

### Student
- ✅ Ask questions
- ✅ Answer questions
- ✅ Vote on content
- ✅ Comment on questions/answers
- ✅ Edit/delete own content

### Expert
- ✅ All student permissions
- ✅ Verify answers
- ✅ Pin questions
- ✅ Edit/delete any question or answer

### Admin
- ✅ All expert permissions
- ✅ Full system access
- ✅ Complete moderation capabilities

For detailed permissions, see [ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md).

---

## 🌐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Production example
# NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
```

**Note**: All environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## 🚀 Deployment

### Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Other Platforms

The application can also be deployed to:
- **Netlify** - Similar to Vercel
- **Railway** - Full-stack deployment
- **Render** - Simple deployment platform
- **AWS Amplify** - AWS hosting solution

### Build Configuration

The project includes `vercel.json` for optimized Vercel deployment:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

---

## 📚 Documentation

### Design Documentation
- **[Design.md](./Design.md)** - UML class diagram and data model
- **[docs/Design.md](./docs/Design.md)** - Alternative location

### Deployment Guides
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Frontend deployment guide
- **[BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md)** - Backend deployment guide

### Feature Documentation
- **[ROLE_PERMISSIONS.md](./ROLE_PERMISSIONS.md)** - Role-based permissions
- **[CONCURRENT_LOGINS.md](./CONCURRENT_LOGINS.md)** - Concurrent login support

---

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Component-based architecture

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Ensure responsive design
- Test on multiple browsers

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Zaiyaan Najam** - [GitHub](https://github.com/zaiyaanmessi)

---

## 🙏 Acknowledgments

- Inspired by Stack Overflow
- Built with Next.js and React
- Icons from React Icons
- Design patterns from industry best practices

---

## 📞 Support

For support, please open an issue in the [GitHub repository](https://github.com/zaiyaanmessi/devflow-frontend/issues).

---

<div align="center">

**Made with ❤️ using Next.js and TypeScript**

[⬆ Back to Top](#-devflow---qa-platform)

</div>
