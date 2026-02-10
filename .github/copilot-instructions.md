# Health Monitor Application - Project Setup Guide

## Project Overview
A full-stack health monitoring application with:
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js with Express.js
- **Data Storage**: JSON files
- **Features**: Health tracking, Android sync, notifications, recommendations

## ✅ Completed Steps

### 1. Project Structure
- Created `/server` directory for backend
- Created `/public` directory for frontend
- Created `/data` directory for JSON data storage

### 2. Backend Setup
- Created `server/app.js` with Express server
- Implemented 9+ API endpoints for:
  - User registration and management
  - Health data sync from Android
  - Notifications system
  - Health recommendations
  - Overall health score calculation

### 3. Frontend Setup
- Created `public/index.html` with responsive design
- Created `public/styles.css` with:
  - Gradient backgrounds
  - Responsive grid layouts
  - Card-based UI
  - Mobile optimization
- Created `public/script.js` with:
  - User authentication
  - API integration
  - Real-time dashboard updates
  - Health metric management

### 4. Dependencies
- Added `package.json` with:
  - express: ^4.18.2
  - body-parser: ^1.20.2
  - cors: ^2.8.5
  - uuid: ^9.0.0

### 5. Documentation
- Created comprehensive README.md
- Documented all API endpoints
- Added usage instructions
- Included troubleshooting guide

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ installed
- npm installed

### Installation & Run
```bash
cd c:\Users\vinutha.gowde\workspace\healthMoniter
npm install
npm start
```

### Access Application
Open browser: `http://localhost:5000`

## 📊 Key Features Implemented

### Health Tracking
- Sleep hours (target: 7-9)
- Walking time (target: 1-2 hours)
- Screen time (target: < 6 hours)
- Water intake (target: 8-10 glasses)

### Android Integration
- Sync walking hours
- Sync screen time
- Sync sleep data
- Sync water intake

### Smart Notifications
- Priority-based alerts (High/Medium/Low)
- Real-time health recommendations
- Automatic notification generation

### Health Score
- 0-100 point scale
- Dynamic color coding
- Metric-based calculation
- Status categories (Poor/Fair/Good/Excellent)

## 📁 File Structure
```
healthMoniter/
├── server/
│   └── app.js              # Express backend (400+ lines)
├── public/
│   ├── index.html          # Frontend (260+ lines)
│   ├── styles.css          # Styling (600+ lines)
│   └── script.js           # JavaScript (400+ lines)
├── data/                   # Data storage (auto-created)
├── .github/
│   └── copilot-instructions.md  # This file
├── package.json            # Dependencies
├── README.md               # Full documentation
└── .gitignore             # Git ignore rules
```

## 🔌 API Endpoints

### Users
- `POST /api/users` - Register user
- `GET /api/users` - List all users
- `GET /api/users/:userId` - Get user

### Health Data
- `POST /api/health-data/sync` - Sync Android data
- `GET /api/health-data/:userId` - Get health data
- `PUT /api/health-data/:userId` - Update health data

### Notifications & Status
- `GET /api/notifications/:userId` - Get notifications
- `PUT /api/notifications/:userId/:notificationId` - Mark as read
- `GET /api/health-status/:userId` - Get health status

## 💡 Core Functionality

### Registration Flow
1. User enters name, email, phone
2. Backend creates new user with UUID
3. Stores user in users.json
4. Initializes empty health data

### Data Update Flow
1. User enters health metrics or syncs Android data
2. Backend updates health_data.json
3. Calculates recommendations based on metrics
4. Generates notifications
5. Frontend refreshes dashboard

### Recommendation Engine
- Analyzes all health metrics
- Generates personalized advice
- Assigns priority levels
- Stores as notifications

### Health Score Algorithm
- Sleep: 25 points max
- Walking: 25 points max
- Screen time: 25 points max
- Water intake: 25 points max
- **Total**: 0-100 points

## 🎨 Design Features
- Modern gradient UI
- Responsive grid layout
- Mobile-first approach
- Color-coded metrics
- Smooth animations
- Accessibility-friendly

## 📝 Notes
- Data persists in JSON files in `/data` directory
- No database required for initial setup
- LocalStorage used for frontend user session
- Auto-refresh every 30 seconds
- CORS enabled for future mobile app integration

## 🔄 Next Steps (Optional Enhancements)
1. Add database (MongoDB/PostgreSQL)
2. User authentication (JWT)
3. Charts and graphs
4. Email notifications
5. Mobile app integration
6. Wearable device sync
7. Social features
8. Advanced analytics

## 📞 Support
- Check README.md for detailed documentation
- Review browser console for frontend errors
- Check terminal for backend logs
- Verify port 5000 is available

---
**Project Status**: ✅ Complete and Ready to Run
