# 🚀 Health Monitor - Setup & Usage Guide

## ⚡ Quick Start (5 minutes)

### Step 1: Install Node.js
If you don't have Node.js installed:
1. Visit https://nodejs.org/
2. Download the LTS version
3. Install it (accepts all defaults)
4. Restart your computer or terminal

### Step 2: Start the Server
Open PowerShell/CMD in the project folder and run:

**Option A: Using PowerShell Script (Recommended for Windows)**
```powershell
.\start.ps1
```

**Option B: Using Batch File**
```cmd
start.bat
```

**Option C: Manual Command**
```bash
npm install
npm start
```

### Step 3: Open in Browser
Go to: **http://localhost:5000**

---

## 📱 Application Features

### 1️⃣ User Registration
- Enter your name, email, and phone number
- Click "Start Tracking"
- Your account is created (stored locally)

### 2️⃣ Health Dashboard
View your personalized health dashboard with:
- **Health Score**: 0-100% overall health rating
- **Sleep Tracking**: Hours of sleep (target: 7-9 hours)
- **Walking Time**: Daily walking (target: 1-2 hours)
- **Screen Time**: Device usage (target: <6 hours)
- **Water Intake**: Daily hydration (target: 8-10 glasses)

### 3️⃣ Manual Entry
For each metric (sleep, walking, screen, water):
1. Enter the value in the input field
2. Click "Update"
3. See your score update instantly

### 4️⃣ Android Sync
Sync your phone data:
1. Get values from your Android phone:
   - Walking hours (from Google Fit or step counter)
   - Screen time (from Settings > Digital Wellbeing)
   - Sleep hours (from Google Fit or health app)
   - Water glasses (manual entry)
2. Fill in the "Sync Android Device" form
3. Click "Sync Data"
4. System generates personalized alerts

### 5️⃣ Smart Recommendations
Get instant health advice:
- ⚠️ High priority alerts (in red)
- 🟠 Medium priority alerts (in orange)
- ✓ Low priority alerts (in green)

### 6️⃣ Health Alerts
View recent notifications about your health status

---

## 📊 Understanding Your Health Score

### Score Breakdown
```
90-100: Excellent 💚 (Dark Green)
75-89:  Good 💚 (Green)
50-74:  Fair ⚠️ (Orange)
0-49:   Poor 🔴 (Red)
```

### How It's Calculated
Each metric contributes 25 points:
- **Sleep**: On target (7-9 hrs) = 25 points
- **Walking**: On target (1+ hrs) = 25 points
- **Screen Time**: Low (<6 hrs) = 25 points
- **Water**: Sufficient (8+ glasses) = 25 points

---

## 🤖 Example Scenarios

### Scenario 1: Poor Sleep Alert
```
Sleep: 5 hours (target: 7-9)
Alert: ⚠️ High Priority
Message: "You need more sleep! Aim for 7-9 hours per night."
Score Impact: -25 points
```

### Scenario 2: Good Health Day
```
Sleep:     8 hours   ✓
Walking:   2 hours   ✓
Screen:    4 hours   ✓
Water:    10 glasses ✓
Score: 100/100 (Excellent)
```

### Scenario 3: Mixed Metrics
```
Sleep:     7 hours   ✓ (+25)
Walking:   0.5 hours ✗ (-25)
Screen:    7 hours   ✗ (-25)
Water:     6 glasses ✗ (-25)
Score: 25/100 (Poor)
```

---

## 💾 Data Storage

### Local Storage
All data is stored on your computer:
- **users.json** - User profiles
- **health_data.json** - Your health metrics
- **notifications.json** - Health alerts

### Important
- Data is NOT sent to external servers
- You can back up the `/data` folder
- Clearing browser data won't delete your health records

---

## 🔐 Privacy & Security

✅ **What's Protected**
- All data stored locally on your device
- No cloud sync (unless you add it)
- No third-party tracking
- No data sharing

---

## ⚙️ API Endpoints (For Developers)

### Register User
```bash
POST http://localhost:5000/api/users
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

### Sync Android Data
```bash
POST http://localhost:5000/api/health-data/sync
Body: {
  "userId": "user-id",
  "walkingHours": 2.5,
  "screenTimeHours": 5,
  "sleepHours": 7,
  "waterGlasses": 8
}
```

### Get Health Data
```bash
GET http://localhost:5000/api/health-data/{userId}
```

### Update Metrics
```bash
PUT http://localhost:5000/api/health-data/{userId}
Body: {
  "sleepHours": 8,
  "walkingHours": 2,
  "screenTimeHours": 4,
  "waterGlasses": 10
}
```

### Get Notifications
```bash
GET http://localhost:5000/api/notifications/{userId}
```

### Get Health Status
```bash
GET http://localhost:5000/api/health-status/{userId}
```

---

## 🐛 Troubleshooting

### Problem: "Server won't start"
**Solution:**
```bash
# Check Node.js is installed
node --version

# Reinstall dependencies
rm -r node_modules
npm install

# Try starting again
npm start
```

### Problem: "Can't connect to localhost:5000"
**Solution:**
1. Check if server is running (look for console output)
2. Try a different port (edit `server/app.js` line: `const PORT = 5000;`)
3. Ensure port 5000 is not blocked by firewall

### Problem: "Data not saving"
**Solution:**
1. Check `/data` folder exists
2. Verify write permissions
3. Look at browser console (F12) for errors

### Problem: "Android sync not working"
**Solution:**
1. Check server console for error messages
2. Ensure all numeric values are valid
3. Clear browser cache and reload

### Problem: "Notifications not showing"
**Solution:**
1. Enter some metrics first
2. Wait 30 seconds for auto-refresh
3. Manually click an "Update" button to trigger notification generation

---

## 🎯 Best Practices

### Daily Usage
1. **Morning**: Enter sleep hours from last night
2. **Midday**: Sync Android data or manual entry
3. **Evening**: Update evening metrics (screen time, water)

### Optimal Targets
- **Sleep**: 7-9 hours (consistency is key)
- **Walking**: 1-2 hours daily
- **Screen**: Less than 6 hours
- **Water**: 8-10 glasses throughout the day

### Tips for Better Health
- Set reminders for each metric
- Log data at same time daily
- Aim for consistency over perfection
- Review recommendations weekly

---

## 📱 Android Integration Steps

### For Google Fit Users:
1. Open Google Fit app
2. Note down today's walking/steps
3. Check Sleep tab for sleep data
4. Enter into Health Monitor "Sync Android" form

### For Samsung Health Users:
1. Open Samsung Health
2. Check Dashboard for daily steps
3. Go to Sleep section
4. Manually enter into Health Monitor

### For Other Devices:
Use built-in health or fitness apps to get metrics, then manually enter them.

---

## 🔄 Auto-Refresh Features

The app automatically:
- ✓ Refreshes health score every 30 seconds
- ✓ Updates notifications in real-time
- ✓ Calculates recommendations on each update
- ✓ Saves user session to browser memory

---

## 📈 Performance Notes

- **Fast**: Loads in under 1 second
- **Responsive**: Works on all screen sizes
- **Light**: No heavy frameworks
- **Offline**: Works without internet (except sync)

---

## 🎨 UI/UX Features

- 🎨 **Color Coded**: Red (poor), Orange (fair), Green (good)
- 📱 **Mobile Ready**: Use on phone, tablet, or desktop
- ⚡ **Fast Loading**: Optimized for speed
- 🎯 **Intuitive**: Self-explanatory interface
- ♿ **Accessible**: Works with keyboard navigation

---

## 💡 Tips & Tricks

### Tip 1: Keyboard Shortcuts
- Tab: Move between inputs
- Enter: Submit form

### Tip 2: Sync Multiple Days
You can update metrics for multiple days by changing dates in your manual entries

### Tip 3: Batch Android Sync
Collect all Android data, then sync once daily (e.g., before bed)

### Tip 4: Health Trends
Note your score patterns:
- Same time every day = better trends
- Weekly average = better indicator than daily

---

## 🚀 Next Features (Optional)

Users can request these features:
- History charts and graphs
- Export data as CSV/PDF
- Email notifications
- Mobile app version
- Wearable device integration
- Social sharing (optional)
- Multiple users on one device
- Dark mode

---

## 📞 Support Checklist

Before reporting issues:
- [ ] Node.js is installed (`node --version` works)
- [ ] Dependencies are installed (`npm list` shows packages)
- [ ] Server is running (shows startup message)
- [ ] Browser is at `http://localhost:5000`
- [ ] JavaScript is enabled in browser
- [ ] No firewall blocking port 5000
- [ ] Cache is cleared (Ctrl+Shift+Delete)

---

## ✅ You're All Set!

Enjoy tracking your health! 💚

**Questions?** Check the README.md or review the code comments.

Happy Health Tracking! 🎉
