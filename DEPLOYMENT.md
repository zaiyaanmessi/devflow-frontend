# Deployment Guide for CodeQ Frontend & Backend

This guide will help you deploy both the frontend and backend of your CodeQ application to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your backend code (separate repository or folder)

---

## Part 1: Deploy Frontend to Vercel

### Step 1: Push Frontend to GitHub

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub and push:
   ```bash
   git remote add origin https://github.com/yourusername/devflow-frontend.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository (`devflow-frontend`)
4. Vercel will auto-detect Next.js
5. **Configure Environment Variables:**
   - Click "Environment Variables"
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.vercel.app/api`
   - (You'll update this after deploying the backend)
6. Click **"Deploy"**

### Step 3: Update Environment Variable After Backend Deployment

Once your backend is deployed, update the `NEXT_PUBLIC_API_URL` in Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Update `NEXT_PUBLIC_API_URL` to your backend URL
4. Redeploy the frontend

---

## Part 2: Deploy Backend to Vercel

You have two options for deploying the backend:

### Option A: Deploy Backend as Vercel Serverless Functions (Recommended)

If your backend is a Node.js/Express API, you can convert it to Vercel serverless functions.

#### Step 1: Prepare Backend for Vercel

1. Create `vercel.json` in your backend root:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

2. Ensure your backend entry point (e.g., `server.js` or `index.js`) exports the handler:
   ```javascript
   // Example for Express
   const express = require('express');
   const app = express();
   
   // ... your routes ...
   
   module.exports = app; // or app.listen() for serverless
   ```

#### Step 2: Deploy Backend to Vercel

1. Push backend to GitHub (separate repository)
2. In Vercel, create a new project
3. Import your backend repository
4. Configure environment variables (database URLs, JWT secrets, etc.)
5. Deploy

### Option B: Deploy Backend to Alternative Platform

If your backend uses features not compatible with serverless (e.g., WebSockets, long-running processes), deploy to:

#### Railway (Recommended for Node.js backends)
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repository
4. Add environment variables
5. Deploy

#### Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure build and start commands
5. Add environment variables
6. Deploy

---

## Part 3: Configure CORS (Important!)

After deploying both frontend and backend, ensure CORS is configured in your backend:

```javascript
// Example CORS configuration
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000', // Local dev
    'https://your-frontend.vercel.app' // Production
  ],
  credentials: true
}));
```

---

## Part 4: Environment Variables Checklist

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL` - Your backend API URL

### Backend (Vercel/Railway/Render)
- Database connection string (MongoDB, PostgreSQL, etc.)
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Set to `production`
- Any other API keys or secrets your backend uses

---

## Part 5: Post-Deployment Steps

1. **Update Frontend API URL:**
   - Go to Vercel project settings
   - Update `NEXT_PUBLIC_API_URL` environment variable
   - Redeploy frontend

2. **Test the Application:**
   - Visit your frontend URL
   - Test login/register
   - Test creating questions
   - Verify API calls work

3. **Set up Custom Domain (Optional):**
   - In Vercel project settings, go to "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

---

## Troubleshooting

### Frontend Issues

**Build Fails:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript errors are fixed

**API Calls Fail:**
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend is deployed and accessible
- Check browser console for CORS errors

### Backend Issues

**Serverless Function Timeout:**
- Vercel has a 10-second timeout for Hobby plan
- Consider upgrading or optimizing your API calls
- Use background jobs for long-running tasks

**Database Connection Issues:**
- Verify database connection string is correct
- Check if your database allows connections from Vercel IPs
- For MongoDB Atlas, whitelist `0.0.0.0/0` or Vercel IPs

---

## Quick Deploy Commands

### Frontend
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Backend (if using Vercel)
```bash
cd backend-folder
vercel
```

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure CORS is configured properly

---

## Notes

- Vercel Hobby plan is free but has limitations
- For production, consider Vercel Pro or alternative platforms
- Always use environment variables for sensitive data
- Never commit `.env` files to Git

