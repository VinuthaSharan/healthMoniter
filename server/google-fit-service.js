/**
 * Google Fit Integration Service
 * Handles OAuth authentication and data sync from Google Fit
 */

const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const fs = require('fs');
const path = require('path');

// Configuration - Update these with your Google Cloud credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/google-fit/callback';

// Token storage directory
const tokenDir = path.join(__dirname, '../data/tokens');
if (!fs.existsSync(tokenDir)) {
  fs.mkdirSync(tokenDir, { recursive: true });
}

/**
 * Create OAuth2 client
 */
function createOAuth2Client() {
  return new OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

/**
 * Get authorization URL for user to authenticate
 */
function getAuthorizationUrl() {
  const oauth2Client = createOAuth2Client();
  
  const scopes = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.sleep.read',
    'https://www.googleapis.com/auth/fitness.nutrition.read'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: Math.random().toString(36).substring(7) // Random state for security
  });

  return authUrl;
}

/**
 * Exchange authorization code for tokens
 */
async function getTokensFromCode(code) {
  const oauth2Client = createOAuth2Client();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Error getting tokens from code:', error);
    throw error;
  }
}

/**
 * Save tokens for a user
 */
function saveUserTokens(userId, tokens) {
  const tokenFile = path.join(tokenDir, `${userId}_tokens.json`);
  fs.writeFileSync(tokenFile, JSON.stringify(tokens, null, 2));
}

/**
 * Load tokens for a user
 */
function loadUserTokens(userId) {
  const tokenFile = path.join(tokenDir, `${userId}_tokens.json`);
  
  if (!fs.existsSync(tokenFile)) {
    return null;
  }
  
  try {
    const data = fs.readFileSync(tokenFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading tokens:', error);
    return null;
  }
}

/**
 * Check if user has valid Google Fit token
 */
function hasValidToken(userId) {
  const tokens = loadUserTokens(userId);
  return tokens && tokens.access_token;
}

/**
 * Create authenticated fitness client
 */
function createFitnessClient(tokens) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);
  
  return google.fitness({
    version: 'v1',
    auth: oauth2Client
  });
}

/**
 * Get step count from Google Fit
 */
async function getStepData(userId, tokens) {
  try {
    const fitness = createFitnessClient(tokens);
    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    const response = await fitness.users.dataset.aggregate({
      userId: 'me',
      requestBody: {
        aggregateBy: [{
          dataTypeName: 'com.google.step_count.delta'
        }],
        bucketByTime: { durationMillis: 86400000 }, // 1 day
        startTimeMillis: startTime.getTime(),
        endTimeMillis: now.getTime()
      }
    });

    // Extract step count
    let steps = 0;
    if (response.data.bucket && response.data.bucket.length > 0) {
      const bucket = response.data.bucket[0];
      if (bucket.dataset && bucket.dataset.length > 0) {
        const dataset = bucket.dataset[0];
        if (dataset.point && dataset.point.length > 0) {
          steps = dataset.point[0].value[0].intVal || 0;
        }
      }
    }

    // Convert steps to walking hours (assuming ~4000 steps per hour)
    const walkingHours = (steps / 4000).toFixed(2);
    
    return {
      steps: steps,
      walkingHours: parseFloat(walkingHours),
      source: 'Google Fit',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching step data:', error);
    throw error;
  }
}

/**
 * Get sleep data from Google Fit
 */
async function getSleepData(userId, tokens) {
  try {
    const fitness = createFitnessClient(tokens);
    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    const response = await fitness.users.dataset.aggregate({
      userId: 'me',
      requestBody: {
        aggregateBy: [{
          dataTypeName: 'com.google.sleep.segment'
        }],
        bucketByTime: { durationMillis: 86400000 }, // 1 day
        startTimeMillis: startTime.getTime(),
        endTimeMillis: now.getTime()
      }
    });

    // Extract sleep duration
    let sleepMs = 0;
    if (response.data.bucket && response.data.bucket.length > 0) {
      const bucket = response.data.bucket[0];
      if (bucket.dataset && bucket.dataset.length > 0) {
        const dataset = bucket.dataset[0];
        if (dataset.point && dataset.point.length > 0) {
          // Sum all sleep segments
          sleepMs = dataset.point.reduce((total, point) => {
            const duration = point.endTimeNanos - point.startTimeNanos;
            return total + duration;
          }, 0);
        }
      }
    }

    // Convert nanoseconds to hours
    const sleepHours = (sleepMs / (1000 * 60 * 60 * 1000000000)).toFixed(2);
    
    return {
      sleepMs: sleepMs,
      sleepHours: parseFloat(sleepHours),
      source: 'Google Fit',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching sleep data:', error);
    throw error;
  }
}

/**
 * Get heart rate data from Google Fit
 */
async function getHeartRateData(userId, tokens) {
  try {
    const fitness = createFitnessClient(tokens);
    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    const response = await fitness.users.dataset.aggregate({
      userId: 'me',
      requestBody: {
        aggregateBy: [{
          dataTypeName: 'com.google.heart_rate.bpm'
        }],
        bucketByTime: { durationMillis: 86400000 }, // 1 day
        startTimeMillis: startTime.getTime(),
        endTimeMillis: now.getTime()
      }
    });

    // Extract heart rate data
    let avgHeartRate = 0;
    let heartRateCount = 0;

    if (response.data.bucket && response.data.bucket.length > 0) {
      const bucket = response.data.bucket[0];
      if (bucket.dataset && bucket.dataset.length > 0) {
        const dataset = bucket.dataset[0];
        if (dataset.point && dataset.point.length > 0) {
          const sum = dataset.point.reduce((total, point) => {
            return total + (point.value[0].fpVal || 0);
          }, 0);
          avgHeartRate = (sum / dataset.point.length).toFixed(0);
          heartRateCount = dataset.point.length;
        }
      }
    }

    return {
      avgHeartRate: parseInt(avgHeartRate),
      measurements: heartRateCount,
      source: 'Google Fit',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching heart rate data:', error);
    throw error;
  }
}

/**
 * Get all health data from Google Fit
 */
async function getAllHealthData(userId, tokens) {
  try {
    const [stepData, sleepData, heartData] = await Promise.all([
      getStepData(userId, tokens),
      getSleepData(userId, tokens),
      getHeartRateData(userId, tokens)
    ]);

    return {
      success: true,
      data: {
        walkingHours: stepData.walkingHours,
        steps: stepData.steps,
        sleepHours: sleepData.sleepHours,
        avgHeartRate: heartData.avgHeartRate,
        source: 'Google Fit',
        syncedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error getting all health data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Revoke Google Fit access for a user
 */
async function revokeAccess(userId, tokens) {
  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(tokens);
    
    await oauth2Client.revokeCredentials();
    
    // Delete stored tokens
    const tokenFile = path.join(tokenDir, `${userId}_tokens.json`);
    if (fs.existsSync(tokenFile)) {
      fs.unlinkSync(tokenFile);
    }

    return { success: true };
  } catch (error) {
    console.error('Error revoking access:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  getAuthorizationUrl,
  getTokensFromCode,
  saveUserTokens,
  loadUserTokens,
  hasValidToken,
  getAllHealthData,
  getStepData,
  getSleepData,
  getHeartRateData,
  revokeAccess,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
};
