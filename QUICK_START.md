# 🚀 Quick Start - 30 Seconds to Running

## One-Line Start (Copy & Paste)

### PowerShell
```powershell
cd c:\Users\vinutha.gowde\workspace\healthMoniter; .\start.ps1
```

### Command Prompt
```cmd
cd c:\Users\vinutha.gowde\workspace\healthMoniter & start.bat
```

### Manual (Terminal)
```bash
cd c:\Users\vinutha.gowde\workspace\healthMoniter
npm install
npm start
```

## Then Open Browser
```
http://localhost:5000
```

---

## What You Get

✅ **Dashboard** - Real-time health tracking
✅ **Scoring** - 0-100% health score calculation
✅ **Notifications** - Smart health alerts
✅ **Android Sync** - Sync fitness data
✅ **Recommendations** - Personalized advice

---

## Features at a Glance

| Feature | How to Use |
|---------|-----------|
| **Sleep Tracking** | Enter hours in "Sleep" card |
| **Walking Time** | Enter hours in "Walking" card |
| **Screen Time** | Enter hours in "Screen Time" card |
| **Water Intake** | Enter glasses in "Water" card |
| **Android Sync** | Fill sync form and click "Sync Data" |
| **Health Score** | View automatic calculation |
| **Alerts** | Check notifications section |

---

## Example Usage Flow

```
1. Open http://localhost:5000
   ↓
2. Enter: John Doe, john@email.com, +1234567890
   ↓
3. Click "Start Tracking"
   ↓
4. Dashboard loads
   ↓
5. Enter Sleep: 8 hours → Click Update
   ↓
6. Enter Walking: 1.5 hours → Click Update
   ↓
7. Enter Screen: 4 hours → Click Update
   ↓
8. Enter Water: 9 glasses → Click Update
   ↓
9. Score updates to 100/100 ✅
```

---

## File Locations

| File | Purpose |
|------|---------|
| `/server/app.js` | Backend server |
| `/public/index.html` | Web interface |
| `/public/styles.css` | Styling |
| `/public/script.js` | Frontend logic |
| `/data/` | Your health data |
| `package.json` | Dependencies |

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Refresh | F5 |
| Dev Tools | F12 |
| Clear Cache | Ctrl+Shift+Delete |
| Hard Refresh | Ctrl+F5 |

---

## Targets for Health

| Metric | Target | Max |
|--------|--------|-----|
| Sleep | 7-9 hours | 24 |
| Walking | 1-2 hours | 24 |
| Screen | <6 hours | 24 |
| Water | 8-10 glasses | 20 |

---

## Health Scores

```
90-100 ✅ Excellent (Dark Green)
75-89  💚 Good (Green)
50-74  ⚠️  Fair (Orange)
0-49   ❌ Poor (Red)
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Won't start | Install Node.js from nodejs.org |
| Port in use | Edit `server/app.js` line 8 |
| No data | Refresh page, wait 5 seconds |
| Styles wrong | Ctrl+F5 (hard refresh) |

---

## Commands

```bash
# Start server
npm start

# Install dependencies  
npm install

# View help
npm --help

# Check Node version
node --version
```

---

## Ports

- **Frontend**: http://localhost:5000
- **API Base**: http://localhost:5000/api

---

## API Quick Reference

```
POST   /api/users
GET    /api/users
POST   /api/health-data/sync
GET    /api/health-data/{id}
PUT    /api/health-data/{id}
GET    /api/notifications/{id}
GET    /api/health-status/{id}
```

---

## Data Flow

```
User Input → JavaScript → API → Node.js → JSON → Browser Update
```

---

## Support Docs

- 📖 `README.md` - Full documentation
- 📱 `USAGE_GUIDE.md` - Detailed user guide
- ✅ `COMPLETE.md` - Project completion report

---

## You're Ready! 💚

Run `npm start` and open http://localhost:5000

Enjoy tracking your health!

---

*Health Monitor v1.0.0*
