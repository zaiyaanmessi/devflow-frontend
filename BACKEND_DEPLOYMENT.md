# Backend Deployment Guide

This guide helps you deploy your Node.js/Express backend to Vercel as serverless functions.

## Quick Start: Deploy Backend to Vercel

### Step 1: Prepare Your Backend

Your backend needs to be in a separate folder/repository. Here's what you need:

#### File Structure:
```
backend/
├── server.js (or index.js)
├── package.json
├── vercel.json
└── ... (your other backend files)
```

### Step 2: Create vercel.json for Backend

Create a `vercel.json` file in your backend root:

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
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Step 3: Modify Your Backend Entry Point

Your `server.js` (or `index.js`) should export the app for serverless:

#### For Express:
```javascript
const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://your-frontend.vercel.app'
  ],
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
// ... other routes

// Export for Vercel serverless
module.exports = app;
```

**OR** if you need to keep `app.listen()` for local development:

```javascript
const express = require('express');
const app = express();

// ... your routes and middleware ...

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
```

### Step 4: Update package.json

Ensure your backend `package.json` has:

```json
{
  "name": "codeq-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    // ... your other dependencies
  }
}
```

### Step 5: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Navigate to backend folder:**
   ```bash
   cd path/to/your/backend
   ```

3. **Login to Vercel:**
   ```bash
   vercel login
   ```

4. **Deploy:**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? **No** (first time)
   - Project name: `codeq-backend` (or your choice)
   - Directory: `.` (current directory)
   - Override settings? **No**

5. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### Step 6: Set Environment Variables

In Vercel dashboard:
1. Go to your backend project
2. Settings → Environment Variables
3. Add:
   - `MONGODB_URI` (or your database connection string)
   - `JWT_SECRET` (your JWT secret key)
   - `FRONTEND_URL` (your frontend Vercel URL)
   - `NODE_ENV` = `production`
   - Any other secrets your backend needs

4. **Redeploy** after adding environment variables

### Step 7: Update Frontend API URL

1. Go to your **frontend** Vercel project
2. Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` to: `https://your-backend-project.vercel.app/api`
4. Redeploy frontend

---

## Alternative: Deploy Backend to Railway

If Vercel serverless doesn't work for your backend, use Railway:

### Step 1: Sign up at [railway.app](https://railway.app)

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your backend repository

### Step 3: Configure
1. Railway auto-detects Node.js
2. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT` (usually auto-set)
   - `FRONTEND_URL`

### Step 4: Deploy
- Railway automatically deploys on push
- Get your backend URL from Railway dashboard
- Update frontend `NEXT_PUBLIC_API_URL` to Railway URL

---

## CORS Configuration

Make sure your backend allows requests from your frontend:

```javascript
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  'https://your-frontend.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
```

---

## Testing Your Deployment

1. **Test Backend:**
   ```bash
   curl https://your-backend.vercel.app/api/health
   ```

2. **Test Frontend:**
   - Visit your frontend URL
   - Try logging in
   - Check browser console for errors

3. **Check Logs:**
   - Vercel: Project → Deployments → Click deployment → View Function Logs
   - Railway: Project → View Logs

---

## Common Issues

### Issue: "Function timeout"
- **Solution:** Optimize your API endpoints or upgrade Vercel plan

### Issue: "Module not found"
- **Solution:** Ensure all dependencies are in `package.json` and committed

### Issue: "Database connection failed"
- **Solution:** 
  - Check database connection string
  - Whitelist Vercel IPs in your database (MongoDB Atlas, etc.)
  - For MongoDB Atlas, allow `0.0.0.0/0` temporarily for testing

### Issue: "CORS errors"
- **Solution:** Update CORS configuration to include your frontend URL

---

## Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set in both projects
- [ ] CORS configured correctly
- [ ] Database accessible from Vercel
- [ ] JWT_SECRET is strong and secure
- [ ] Frontend API URL points to backend
- [ ] Tested login/register flow
- [ ] Tested creating questions
- [ ] Tested all major features

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Check deployment logs in Vercel/Railway dashboard

