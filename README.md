# 💚 Health Monitor Application

A comprehensive health monitoring application designed to track and manage daily health metrics, provide personalized recommendations, and send health alerts. The app syncs with Android devices to automatically collect walking hours, screen time, sleep data, and more.

## Features

### 📊 Health Tracking
- **Sleep Monitoring**: Track daily sleep hours with recommendations for 7-9 hours
- **Walking Tracker**: Monitor daily walking time (target: 1-2 hours)
- **Screen Time**: Track device usage and get alerts if it exceeds 6 hours
- **Water Intake**: Monitor daily water consumption (target: 8-10 glasses)

### 📱 Multiple Sync Options
- **Android Phone Sync**: Direct phone health data syncing via:
  - 🔗 **Google Fit** - Real OAuth 2.0 sync from Google Fit ⭐ **NEW!**
  - 💪 **Samsung Health** - Direct Samsung Health app integration
  - ✏️ **Manual Entry** - Quick manual data input (30 seconds)
- **Smartwatch/Fitness Tracker**: Bluetooth pairing for wearable devices
- **Auto-Sync**: Enable 5-minute automatic health data updates

### 🔔 Smart Notifications
- Personalized health alerts based on your metrics
- Priority-based notifications (High, Medium, Low)
- Real-time recommendations for health improvements

### 📈 Health Score
- Overall health score calculation (0-100)
- Dynamic color-coded health status
- Individual metric assessments

### 💡 Intelligent Recommendations
- AI-driven health suggestions
- Personalized advice based on your metrics
- Actionable insights for better health

## Project Structure

```
healthMoniter/
├── server/
│   └── app.js              # Node.js Express backend server
├── public/
│   ├── index.html          # Frontend HTML
│   ├── styles.css          # Frontend styling
│   └── script.js           # Frontend JavaScript
├── data/
│   ├── users.json          # User data storage
│   ├── health_data.json    # Health metrics storage
│   └── notifications.json  # Notifications storage
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Body-parser** - Middleware for parsing request bodies
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique identifier generation

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with gradients and animations
- **Vanilla JavaScript** - No framework dependencies
- **Responsive Design** - Works on desktop and mobile

### Data Storage
- **JSON Files** - Local file-based data persistence

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Setup Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd c:\Users\vinutha.gowde\workspace\healthMoniter
   ```

2. **Create `.env` file with Google credentials** (for Google Fit)
   ```
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/google-fit/callback
   PORT=5000
   ```
   See [GOOGLEFIT_QUICKSTART.md](./GOOGLEFIT_QUICKSTART.md) for detailed setup

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Open your browser and go to: `http://localhost:5000`

## 🔗 Google Fit Integration

### Real OAuth 2.0 Sync (NEW!)

The app now features **real Google Fit integration** with OAuth 2.0 authentication:

**Setup**: Follow [GOOGLEFIT_QUICKSTART.md](./GOOGLEFIT_QUICKSTART.md) (10 minutes)

**Features**:
- ✅ Secure Google OAuth authentication
- ✅ Automatic health data sync
- ✅ Real steps, sleep, and heart rate data
- ✅ Auto-sync every 30 minutes
- ✅ Manual sync button
- ✅ Easy disconnect/reconnect

**Quick Setup**:
1. Get Google Cloud credentials (5 min)
2. Create `.env` file (1 min)
3. Run `npm install && npm start` (2 min)
4. Click \"Connect Google Fit\" in app (2 min)

See detailed documentation:
- [GOOGLEFIT_QUICKSTART.md](./GOOGLEFIT_QUICKSTART.md) - 10-minute setup
- [GOOGLEFIT_SETUP_GUIDE.md](./GOOGLEFIT_SETUP_GUIDE.md) - Complete setup guide
- [GOOGLEFIT_API_REFERENCE.md](./GOOGLEFIT_API_REFERENCE.md) - API details

## API Endpoints

### User Management
- **POST** `/api/users` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
  ```

- **GET** `/api/users` - Get all users
- **GET** `/api/users/:userId` - Get specific user

### Health Data
- **POST** `/api/health-data/sync` - Sync health data from Android
  ```json
  {
    "userId": "user-id",
    "walkingHours": 2.5,
    "screenTimeHours": 5,
    "sleepHours": 7.5,
    "waterGlasses": 8
  }
  ```

- **GET** `/api/health-data/:userId` - Get user's health data with recommendations
- **PUT** `/api/health-data/:userId` - Update health metrics manually

### Notifications & Status
- **GET** `/api/notifications/:userId` - Get user notifications
- **PUT** `/api/notifications/:userId/:notificationId` - Mark notification as read
- **GET** `/api/health-status/:userId` - Get overall health status and score

### Google Fit Integration (NEW!)
- **GET** `/api/google-fit/auth-url` - Get OAuth authorization URL
- **GET** `/api/google-fit/callback` - OAuth callback handler
- **GET** `/api/google-fit/check-auth/:userId` - Check if user has valid Google Fit tokens
- **GET** `/api/google-fit/sync/:userId` - Fetch and sync health data from Google Fit
- **POST** `/api/google-fit/disconnect/:userId` - Revoke Google Fit access

## Usage

### 1. Register a New User
- Fill in your name, email, and phone number
- Click "Start Tracking"
- Your health monitoring dashboard will be created

### 2. Sync Health Data from Google Fit (NEW!)
- Click \"🔗 Connect Google Fit\" button
- Sign in with your Google account
- Grant permissions to access health data
- Your health data syncs automatically every 30 minutes
- Or click \"🔄 Sync Now\" for instant sync

### 3. Manual Health Entry
- Use the metric cards to manually enter:
  - Sleep hours
  - Walking time
  - Screen time
  - Water intake
- Click "Update" on each card

### 3. Sync Android Data
- Fill in the Android sync form with your device data:
  - Walking hours from today
  - Screen time
  - Sleep hours from last night
  - Water glasses consumed
- Click "Sync Data"

### 4. Monitor Your Health
- View your health score (0-100%)
- Check personalized recommendations
- Monitor health alerts

## Health Recommendations Logic

### Sleep
- **< 6 hours**: ⚠️ Get more sleep (High Priority)
- **6-10 hours**: ✓ Good sleep pattern
- **> 10 hours**: ⚠️ Sleeping too much

### Walking
- **< 1 hour**: ⚠️ Increase walking (High Priority)
- **≥ 1 hour**: ✓ Keep walking

### Screen Time
- **> 6 hours**: ⚠️ Reduce screen time (High Priority)
- **≤ 6 hours**: ✓ Screen time is good

### Water Intake
- **< 6 glasses**: ⚠️ Drink more water (Medium Priority)
- **≥ 8 glasses**: ✓ Good hydration

## Health Score Calculation

The overall health score is calculated based on all metrics:
- Each metric can contribute up to 25 points
- Score ranges: 0-100
- **0-50**: Poor Health (Red)
- **50-75**: Fair Health (Orange)
- **75-90**: Good Health (Green)
- **90-100**: Excellent Health (Dark Green)

## Android Integration Guide

To sync data from your Android device:

1. **Walking Hours**: Use Google Fit or similar fitness app
2. **Screen Time**: Check Android Settings > Digital Wellbeing
3. **Sleep Hours**: Use Google Fit or Samsung Health
4. **Water Intake**: Manually track using water intake apps

Simply enter these values in the "Sync Android Device" form on the dashboard.

## Local Development

### Running in Development Mode
```bash
npm run dev
```

### Project Structure
- Data files are stored in JSON format in the `data/` directory
- User data is persisted across sessions
- Frontend state is managed via localStorage

## Features in Detail

### Real-time Updates
- Health data updates trigger automatic notifications
- Dashboard refreshes automatically every 30 seconds
- Instant feedback on metric changes

### Responsive Design
- Works on desktop computers
- Tablet-optimized interface
- Mobile-friendly design

### Data Persistence
- All user data is stored locally
- No cloud dependency
- Data saved in JSON files

### Privacy & Security
- No external API calls (except frontend-backend communication)
- All data stored locally
- User data can be easily backed up

## Troubleshooting

### Server won't start
- Ensure Node.js is installed: `node --version`
- Check if port 5000 is available
- Try: `npm install` again

### Frontend not loading
- Clear browser cache
- Check if server is running on `http://localhost:5000`
- Open browser console for errors

### Data not syncing
- Check browser console for errors
- Ensure server is running
- Verify user is registered

## Future Enhancements

- Database integration (MongoDB, PostgreSQL)
- User authentication (JWT tokens)
- Mobile app for iOS and Android
- Wearable device integration
- Historical data analytics
- Charts and graphs for metrics
- Email notifications
- Social features (compare with friends)
- Meal tracking and calorie counting
- Exercise tracking

## License

ISC License - Feel free to use and modify

## Support

For issues or questions, check:
1. Browser console (F12) for errors
2. Server terminal for logs
3. Ensure all dependencies are installed

## Credits

Built with ❤️ for health-conscious individuals

---

**Start your health journey today! 💚**
