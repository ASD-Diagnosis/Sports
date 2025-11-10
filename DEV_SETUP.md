# Development Environment Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)
- MongoDB (local or Atlas cloud)
- Git

## Quick Start - Run Everything with One Command

### Option 1: Using Root Directory Commands (Recommended)

**First time setup:**
```powershell
cd "c:\Users\ashis\Downloads\varuna Assignment\sprt"
npm install
npm run install:all
```

**Run development environment:**
```powershell
npm run dev
```

This will start both backend and frontend simultaneously:
- 🔧 Backend: http://localhost:5000/api
- 🎨 Frontend: http://localhost:3000

---

## Manual Setup (If Preferred)

### Step 1: Setup Backend

```powershell
cd "c:\Users\ashis\Downloads\varuna Assignment\sprt\backend"
npm install
```

**Configure Backend Environment Variables (.env):**
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sports-ticketing
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Run Backend:**
```powershell
npm run dev
```

Backend runs on: **http://localhost:5000**

---

### Step 2: Setup Frontend

```powershell
cd "c:\Users\ashis\Downloads\varuna Assignment\sprt\frontend"
npm install
```

**Configure Frontend Environment Variables (.env):**
```
REACT_APP_API_URL=http://localhost:5000/api
```

**Run Frontend:**
```powershell
npm start
```

Frontend runs on: **http://localhost:3000**

---

## Database Setup

### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Update `MONGODB_URI` in backend `.env`

### Option B: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and database
3. Get connection string
4. Update `MONGODB_URI` in backend `.env`

Example:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sports-ticketing
```

---

## Generate JWT Secret

Run this command to generate a secure JWT secret:

```powershell
cd backend
node createSecret.js
```

This will automatically update your `.env` file with a secure JWT_SECRET.

---

## Generate JWT Token for Testing

```powershell
cd backend
node generateToken.js <user-id>
```

Example:
```powershell
node generateToken.js 507f1f77bcf86cd799439011
```

---

## Useful npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run both backend & frontend |
| `npm run dev:backend` | Run backend only |
| `npm run dev:frontend` | Run frontend only |
| `npm run install:all` | Install all dependencies |

### Backend Scripts
```powershell
cd backend
npm start          # Production mode
npm run dev        # Development mode (with nodemon)
```

### Frontend Scripts
```powershell
cd frontend
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
```

---

## Project Structure

```
sprt/
├── backend/
│   ├── server.js              # Main server file
│   ├── package.json
│   ├── .env                   # Backend config
│   ├── routes/                # API routes
│   ├── controllers/           # Route handlers
│   ├── models/                # MongoDB schemas
│   ├── middleware/            # Custom middleware
│   └── utils/                 # Helper functions
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html        # Main HTML
│   ├── src/
│   │   ├── App.js            # Main app component
│   │   ├── index.js          # React entry point
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── redux/            # Redux store
│   │   └── ...
│   └── .env                  # Frontend config
└── package.json              # Root config
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Tickets
- `GET /api/tickets` - Get user tickets
- `POST /api/tickets` - Book ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Cancel ticket

### Health Check
- `GET /api/health` - Check API status

---

## Troubleshooting

### MongoDB Connection Error
```
Error: MongoDB connection error
```
**Solution:** Ensure MongoDB is running or update `MONGODB_URI` in `.env`

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change PORT in backend `.env` or kill the process using the port

### Module Not Found
```
Error: Cannot find module
```
**Solution:** Run `npm install` in the affected directory

### Frontend Can't Connect to Backend
```
Network Error / CORS Error
```
**Solution:** Check if backend is running on http://localhost:5000 and `REACT_APP_API_URL` is correct

### JWT Secret Error
```
Error: JWT_SECRET is not set
```
**Solution:** Run `node createSecret.js` in backend directory

---

## Environment File Reference

### Backend .env
```properties
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/sports-ticketing

# JWT
JWT_SECRET=your-256-bit-secret-key
JWT_EXPIRE=7d

# Frontend
CLIENT_URL=http://localhost:3000

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# File Upload
MAX_FILE_SIZE=5000000
FILE_UPLOAD_PATH=./uploads
```

### Frontend .env
```properties
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Next Steps

1. ✅ Install dependencies: `npm run install:all`
2. ✅ Generate JWT secret: `cd backend && node createSecret.js`
3. ✅ Configure MongoDB connection
4. ✅ Start dev environment: `npm run dev`
5. 🌐 Open http://localhost:3000 in browser

Happy coding! 🚀
