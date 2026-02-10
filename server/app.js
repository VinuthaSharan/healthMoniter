const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bluetoothService = require('./bluetooth-service');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Data file path
const dataDir = path.join(__dirname, '../data');
const usersFile = path.join(dataDir, 'users.json');
const healthDataFile = path.join(dataDir, 'health_data.json');
const notificationsFile = path.join(dataDir, 'notifications.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files
function initializeDataFiles() {
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(healthDataFile)) {
    fs.writeFileSync(healthDataFile, JSON.stringify({}, null, 2));
  }
  if (!fs.existsSync(notificationsFile)) {
    fs.writeFileSync(notificationsFile, JSON.stringify({}, null, 2));
  }
}

initializeDataFiles();
bluetoothService.initializeBluetoothStorage();

// Helper functions
function readFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data || '{}');
}

function writeFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getHealthRecommendations(userId) {
  const allData = readFile(healthDataFile);
  const userData = allData[userId] || {};
  const recommendations = [];

  // Sleep recommendations
  const avgSleep = userData.avgSleepHours || 0;
  if (avgSleep < 6) {
    recommendations.push({
      type: 'sleep',
      message: '⚠️ You need more sleep! Aim for 7-9 hours per night.',
      priority: 'high'
    });
  } else if (avgSleep > 10) {
    recommendations.push({
      type: 'sleep',
      message: '✓ Good sleep pattern! Keep it consistent.',
      priority: 'low'
    });
  }

  // Walking recommendations
  const walkingHours = userData.walkingHours || 0;
  if (walkingHours < 1) {
    recommendations.push({
      type: 'walking',
      message: '⚠️ Increase your walking time! Aim for at least 30 minutes daily.',
      priority: 'high'
    });
  } else if (walkingHours >= 1 && walkingHours < 2) {
    recommendations.push({
      type: 'walking',
      message: '✓ Good walking routine! Try to maintain or increase it.',
      priority: 'low'
    });
  }

  // Screen time recommendations
  const screenHours = userData.screenTimeHours || 0;
  if (screenHours > 6) {
    recommendations.push({
      type: 'screen',
      message: '⚠️ High screen time detected! Try to reduce it to under 6 hours.',
      priority: 'high'
    });
  }

  // Water intake recommendations
  const waterIntake = userData.waterGlasses || 0;
  if (waterIntake < 6) {
    recommendations.push({
      type: 'water',
      message: '⚠️ Drink more water! Aim for 8-10 glasses daily.',
      priority: 'medium'
    });
  }

  return recommendations;
}

function createNotifications(userId) {
  const recommendations = getHealthRecommendations(userId);
  const notificationsData = readFile(notificationsFile);
  
  if (!notificationsData[userId]) {
    notificationsData[userId] = [];
  }

  const newNotifications = recommendations.map(rec => ({
    id: uuidv4(),
    userId,
    message: rec.message,
    type: rec.type,
    priority: rec.priority,
    timestamp: new Date().toISOString(),
    read: false
  }));

  notificationsData[userId].push(...newNotifications);
  writeFile(notificationsFile, notificationsData);
  
  return newNotifications;
}

// Routes

// Register/Create user
app.post('/api/users', (req, res) => {
  const { name, email, phone } = req.body;
  const users = readFile(usersFile);
  
  const newUser = {
    id: uuidv4(),
    name,
    email,
    phone,
    registeredAt: new Date().toISOString()
  };

  users.push(newUser);
  writeFile(usersFile, users);
  
  // Initialize empty health data for new user
  const healthData = readFile(healthDataFile);
  healthData[newUser.id] = {
    walkingHours: 0,
    screenTimeHours: 0,
    avgSleepHours: 0,
    waterGlasses: 0,
    lastUpdated: new Date().toISOString()
  };
  writeFile(healthDataFile, healthData);

  res.status(201).json({ success: true, user: newUser });
});

// Get all users
app.get('/api/users', (req, res) => {
  const users = readFile(usersFile);
  res.json(users);
});

// Get single user
app.get('/api/users/:userId', (req, res) => {
  const users = readFile(usersFile);
  const user = users.find(u => u.id === req.params.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// Sync health data from Android device
app.post('/api/health-data/sync', (req, res) => {
  const { userId, walkingHours, screenTimeHours, sleepHours, waterGlasses } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const healthData = readFile(healthDataFile);
  
  if (!healthData[userId]) {
    healthData[userId] = {};
  }

  healthData[userId] = {
    ...healthData[userId],
    walkingHours: walkingHours || 0,
    screenTimeHours: screenTimeHours || 0,
    avgSleepHours: sleepHours || 0,
    waterGlasses: waterGlasses || 0,
    lastUpdated: new Date().toISOString()
  };

  writeFile(healthDataFile, healthData);

  // Generate notifications based on updated data
  const notifications = createNotifications(userId);

  res.json({
    success: true,
    message: 'Health data synced successfully',
    notifications: notifications
  });
});

// Get health data for a user
app.get('/api/health-data/:userId', (req, res) => {
  const healthData = readFile(healthDataFile);
  const userData = healthData[req.params.userId];

  if (!userData) {
    return res.status(404).json({ error: 'No health data found for this user' });
  }

  const recommendations = getHealthRecommendations(req.params.userId);

  res.json({
    healthData: userData,
    recommendations: recommendations
  });
});

// Update health metrics manually
app.put('/api/health-data/:userId', (req, res) => {
  const { walkingHours, screenTimeHours, sleepHours, waterGlasses } = req.body;
  const userId = req.params.userId;

  const healthData = readFile(healthDataFile);

  if (!healthData[userId]) {
    healthData[userId] = {};
  }

  healthData[userId] = {
    ...healthData[userId],
    walkingHours: walkingHours !== undefined ? walkingHours : healthData[userId].walkingHours || 0,
    screenTimeHours: screenTimeHours !== undefined ? screenTimeHours : healthData[userId].screenTimeHours || 0,
    avgSleepHours: sleepHours !== undefined ? sleepHours : healthData[userId].avgSleepHours || 0,
    waterGlasses: waterGlasses !== undefined ? waterGlasses : healthData[userId].waterGlasses || 0,
    lastUpdated: new Date().toISOString()
  };

  writeFile(healthDataFile, healthData);

  // Generate notifications
  const notifications = createNotifications(userId);

  res.json({
    success: true,
    healthData: healthData[userId],
    notifications: notifications
  });
});

// Get notifications for a user
app.get('/api/notifications/:userId', (req, res) => {
  const notificationsData = readFile(notificationsFile);
  const userNotifications = notificationsData[req.params.userId] || [];

  res.json(userNotifications);
});

// Mark notification as read
app.put('/api/notifications/:userId/:notificationId', (req, res) => {
  const { userId, notificationId } = req.params;
  const notificationsData = readFile(notificationsFile);

  if (!notificationsData[userId]) {
    return res.status(404).json({ error: 'User not found' });
  }

  const notification = notificationsData[userId].find(n => n.id === notificationId);
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  notification.read = true;
  writeFile(notificationsFile, notificationsData);

  res.json({ success: true, notification });
});

// Health status endpoint
app.get('/api/health-status/:userId', (req, res) => {
  const healthData = readFile(healthDataFile);
  const userData = healthData[req.params.userId];

  if (!userData) {
    return res.status(404).json({ error: 'No health data found' });
  }

  const status = {
    overallHealth: 'Good',
    score: 100,
    metrics: {
      sleep: userData.avgSleepHours >= 7 && userData.avgSleepHours <= 9 ? '✓' : '✗',
      walking: userData.walkingHours >= 1 ? '✓' : '✗',
      screenTime: userData.screenTimeHours < 6 ? '✓' : '✗',
      waterIntake: userData.waterGlasses >= 8 ? '✓' : '✗'
    }
  };

  // Calculate score
  let score = 100;
  if (status.metrics.sleep === '✗') score -= 25;
  if (status.metrics.walking === '✗') score -= 25;
  if (status.metrics.screenTime === '✗') score -= 25;
  if (status.metrics.waterIntake === '✗') score -= 25;

  status.score = Math.max(0, score);
  if (status.score < 50) status.overallHealth = 'Poor';
  else if (status.score < 75) status.overallHealth = 'Fair';
  else if (status.score < 90) status.overallHealth = 'Good';
  else status.overallHealth = 'Excellent';

  res.json(status);
});

// ==================== BLUETOOTH & WEARABLE INTEGRATION ====================

// Discover nearby Bluetooth devices
app.post('/api/bluetooth/discover', (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const availableDevices = bluetoothService.discoverDevices(userId);

  res.json({
    success: true,
    message: `Found ${availableDevices.length} nearby devices`,
    devices: availableDevices
  });
});

// Pair a Bluetooth device
app.post('/api/bluetooth/pair', (req, res) => {
  const { userId, deviceId, deviceName } = req.body;

  if (!userId || !deviceId) {
    return res.status(400).json({ error: 'userId and deviceId are required' });
  }

  const result = bluetoothService.pairDevice(userId, deviceId, deviceName);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  createNotifications(userId); // Generate notifications for successful pairing
  res.status(201).json({ success: true, device: result.device });
});

// Get paired devices
app.get('/api/bluetooth/paired/:userId', (req, res) => {
  const pairedDevices = bluetoothService.getPairedDevices(req.params.userId);

  res.json({
    success: true,
    count: pairedDevices.length,
    devices: pairedDevices
  });
});

// Unpair a device
app.post('/api/bluetooth/unpair', (req, res) => {
  const { userId, deviceId } = req.body;

  if (!userId || !deviceId) {
    return res.status(400).json({ error: 'userId and deviceId are required' });
  }

  const result = bluetoothService.unpairDevice(userId, deviceId);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true, device: result.device });
});

// Stream real-time data from device
app.post('/api/bluetooth/stream', (req, res) => {
  const { userId, deviceId } = req.body;

  if (!userId || !deviceId) {
    return res.status(400).json({ error: 'userId and deviceId are required' });
  }

  const streamData = bluetoothService.streamDeviceData(userId, deviceId);

  if (!streamData.success) {
    return res.status(400).json({ error: streamData.error });
  }

  res.json(streamData);
});

// Auto-sync device data
app.post('/api/bluetooth/sync', (req, res) => {
  const { userId, deviceId } = req.body;

  if (!userId || !deviceId) {
    return res.status(400).json({ error: 'userId and deviceId are required' });
  }

  const syncResult = bluetoothService.autoSyncDeviceData(userId, deviceId, healthDataFile);

  if (!syncResult.success) {
    return res.status(400).json({ error: syncResult.error });
  }

  // Generate notifications based on synced data
  const notifications = createNotifications(userId);

  res.json({
    success: true,
    message: 'Device data synced successfully',
    device: syncResult.device,
    convertedData: syncResult.convertedData,
    notifications: notifications
  });
});

// Enable auto-sync for a device
app.post('/api/bluetooth/auto-sync/enable', (req, res) => {
  const { userId, deviceId, syncIntervalMinutes } = req.body;

  if (!userId || !deviceId) {
    return res.status(400).json({ error: 'userId and deviceId are required' });
  }

  const result = bluetoothService.enableAutoSync(userId, deviceId, syncIntervalMinutes);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    message: `Auto-sync enabled for ${result.device.deviceName}`,
    device: result.device
  });
});

// Disable auto-sync for a device
app.post('/api/bluetooth/auto-sync/disable', (req, res) => {
  const { userId, deviceId } = req.body;

  if (!userId || !deviceId) {
    return res.status(400).json({ error: 'userId and deviceId are required' });
  }

  const result = bluetoothService.disableAutoSync(userId, deviceId);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    success: true,
    message: `Auto-sync disabled for ${result.device.deviceName}`,
    device: result.device
  });
});

// Get device data history
app.get('/api/bluetooth/history/:userId/:deviceId', (req, res) => {
  const { userId, deviceId } = req.params;
  const limit = req.query.limit || 50;

  const history = bluetoothService.getDeviceDataHistory(userId, deviceId, parseInt(limit));

  res.json({
    success: true,
    count: history.length,
    history: history
  });
});

// Get sync statistics
app.get('/api/bluetooth/stats/:userId', (req, res) => {
  const stats = bluetoothService.getSyncStatistics(req.params.userId);

  res.json({
    success: true,
    stats: stats
  });
});

// ==================== GOOGLE FIT INTEGRATION ====================

const googleFitService = require('./google-fit-service');
require('dotenv').config();

/**
 * GET /api/google-fit/auth-url
 * Get the Google OAuth authorization URL
 */
app.get('/api/google-fit/auth-url', (req, res) => {
  try {
    const authUrl = googleFitService.getAuthorizationUrl();
    res.json({
      success: true,
      authUrl: authUrl,
      message: 'Redirect user to this URL to authorize Google Fit access'
    });
  } catch (error) {
    console.error('Error getting auth URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate authorization URL'
    });
  }
});

/**
 * GET /api/google-fit/callback
 * OAuth callback - handles authorization code from Google
 */
app.get('/api/google-fit/callback', async (req, res) => {
  const { code, state, error } = req.query;
  const userId = req.query.userId || 'default';

  if (error) {
    return res.redirect(`/dashboard?googleFitError=${error}`);
  }

  if (!code) {
    return res.status(400).json({ success: false, error: 'No authorization code provided' });
  }

  try {
    // Exchange code for tokens
    const tokens = await googleFitService.getTokensFromCode(code);
    
    // Save tokens for user
    googleFitService.saveUserTokens(userId, tokens);

    // Redirect back to dashboard with success
    res.redirect(`/dashboard?googleFitConnected=true&userId=${userId}`);
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete authorization'
    });
  }
});

/**
 * GET /api/google-fit/check-auth/:userId
 * Check if user has valid Google Fit authorization
 */
app.get('/api/google-fit/check-auth/:userId', (req, res) => {
  const hasToken = googleFitService.hasValidToken(req.params.userId);
  
  res.json({
    success: true,
    authenticated: hasToken,
    userId: req.params.userId
  });
});

/**
 * GET /api/google-fit/sync/:userId
 * Sync health data from Google Fit
 */
app.get('/api/google-fit/sync/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Check if user has valid token
    const tokens = googleFitService.loadUserTokens(userId);
    
    if (!tokens || !tokens.access_token) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated with Google Fit',
        requiresAuth: true
      });
    }

    // Get health data from Google Fit
    const healthData = await googleFitService.getAllHealthData(userId, tokens);

    if (!healthData.success) {
      return res.status(500).json({
        success: false,
        error: healthData.error
      });
    }

    // Get user's current health data
    const allData = readFile(healthDataFile);
    const currentData = allData[userId] || {};

    // Merge Google Fit data with existing data
    const updatedData = {
      ...currentData,
      walkingHours: healthData.data.walkingHours,
      sleepHours: healthData.data.sleepHours,
      steps: healthData.data.steps,
      avgHeartRate: healthData.data.avgHeartRate,
      lastGoogleFitSync: new Date().toISOString(),
      syncSource: 'Google Fit'
    };

    allData[userId] = updatedData;
    writeFile(healthDataFile, allData);

    // Generate notifications if needed
    const notifications = readFile(notificationsFile);
    if (!notifications[userId]) {
      notifications[userId] = [];
    }

    // Add sync notification
    notifications[userId].push({
      id: uuidv4(),
      type: 'success',
      message: `✅ Successfully synced data from Google Fit! Walking: ${healthData.data.walkingHours}h, Sleep: ${healthData.data.sleepHours}h`,
      timestamp: new Date().toISOString(),
      read: false
    });

    writeFile(notificationsFile, notifications);

    res.json({
      success: true,
      data: healthData.data,
      message: 'Health data synced successfully from Google Fit'
    });
  } catch (error) {
    console.error('Error syncing Google Fit data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync health data from Google Fit'
    });
  }
});

/**
 * POST /api/google-fit/disconnect/:userId
 * Disconnect Google Fit and revoke access
 */
app.post('/api/google-fit/disconnect/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const tokens = googleFitService.loadUserTokens(userId);
    
    if (!tokens) {
      return res.status(400).json({
        success: false,
        error: 'User not connected to Google Fit'
      });
    }

    // Revoke access
    const result = await googleFitService.revokeAccess(userId, tokens);

    if (result.success) {
      res.json({
        success: true,
        message: 'Google Fit access revoked successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error disconnecting Google Fit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect Google Fit'
    });
  }
});

// ==================== END GOOGLE FIT INTEGRATION ====================

// Root route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Health Monitor Server running on http://localhost:${PORT}`);
  console.log(`✅ Bluetooth/Wearable Integration Enabled`);
  console.log(`📱 Supported Devices: Apple Watch, Fitbit, Samsung Galaxy Watch, Garmin, Xiaomi Mi Band`);
});
