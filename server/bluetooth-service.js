/**
 * Bluetooth Service for Health Monitor
 * Handles device pairing, real-time data streaming, and auto-sync
 * Supports: Smartwatches, Fitness Trackers, Health Bands
 */

const fs = require('fs');
const path = require('path');

// Simulated Bluetooth devices database
const bluetoothDevicesFile = path.join(__dirname, '../data/bluetooth_devices.json');

// Initialize Bluetooth devices storage
function initializeBluetoothStorage() {
  if (!fs.existsSync(bluetoothDevicesFile)) {
    fs.writeFileSync(bluetoothDevicesFile, JSON.stringify({
      pairedDevices: [],
      deviceData: {},
      syncLogs: []
    }, null, 2));
  }
}

// Read Bluetooth devices data
function readBluetoothDevices() {
  const data = fs.readFileSync(bluetoothDevicesFile, 'utf8');
  return JSON.parse(data || '{}');
}

// Write Bluetooth devices data
function writeBluetoothDevices(data) {
  fs.writeFileSync(bluetoothDevicesFile, JSON.stringify(data, null, 2));
}

/**
 * Discover nearby Bluetooth devices
 * In a real implementation, this would use noble/bleno or react-native-ble
 */
function discoverDevices(userId) {
  // Simulated discovery - returns available device types
  const availableDevices = [
    {
      id: 'device_apple_watch',
      name: 'Apple Watch Series 7',
      type: 'smartwatch',
      manufacturer: 'Apple',
      supported: ['heart_rate', 'steps', 'sleep', 'calories'],
      rssi: -45,
      discoveredAt: new Date().toISOString()
    },
    {
      id: 'device_fitbit',
      name: 'Fitbit Sense 2',
      type: 'fitness_tracker',
      manufacturer: 'Fitbit',
      supported: ['steps', 'sleep', 'heart_rate', 'water_intake', 'calories'],
      rssi: -55,
      discoveredAt: new Date().toISOString()
    },
    {
      id: 'device_samsung_watch',
      name: 'Samsung Galaxy Watch 5',
      type: 'smartwatch',
      manufacturer: 'Samsung',
      supported: ['heart_rate', 'steps', 'sleep', 'calories', 'stress'],
      rssi: -40,
      discoveredAt: new Date().toISOString()
    },
    {
      id: 'device_garmin',
      name: 'Garmin Forerunner 945',
      type: 'fitness_tracker',
      manufacturer: 'Garmin',
      supported: ['steps', 'sleep', 'heart_rate', 'vo2_max', 'training_load'],
      rssi: -50,
      discoveredAt: new Date().toISOString()
    },
    {
      id: 'device_mi_band',
      name: 'Xiaomi Mi Band 7',
      type: 'fitness_tracker',
      manufacturer: 'Xiaomi',
      supported: ['steps', 'sleep', 'heart_rate', 'water_intake'],
      rssi: -48,
      discoveredAt: new Date().toISOString()
    }
  ];

  return availableDevices;
}

/**
 * Pair a Bluetooth device
 */
function pairDevice(userId, deviceId, deviceName) {
  const btData = readBluetoothDevices();
  
  // Check if already paired
  const existing = btData.pairedDevices.find(d => d.userId === userId && d.deviceId === deviceId);
  if (existing) {
    return { success: false, error: 'Device already paired', device: existing };
  }

  // Find device info
  const allDevices = discoverDevices(userId);
  const deviceInfo = allDevices.find(d => d.id === deviceId);

  if (!deviceInfo) {
    return { success: false, error: 'Device not found' };
  }

  const pairedDevice = {
    userId,
    deviceId,
    deviceName: deviceName || deviceInfo.name,
    type: deviceInfo.type,
    manufacturer: deviceInfo.manufacturer,
    supported: deviceInfo.supported,
    pairedAt: new Date().toISOString(),
    lastSync: null,
    syncInterval: 5, // minutes
    autoSync: true,
    signalStrength: deviceInfo.rssi
  };

  btData.pairedDevices.push(pairedDevice);
  if (!btData.deviceData[userId]) {
    btData.deviceData[userId] = [];
  }

  writeBluetoothDevices(btData);

  return { success: true, device: pairedDevice };
}

/**
 * Unpair a Bluetooth device
 */
function unpairDevice(userId, deviceId) {
  const btData = readBluetoothDevices();
  
  const index = btData.pairedDevices.findIndex(d => d.userId === userId && d.deviceId === deviceId);
  
  if (index === -1) {
    return { success: false, error: 'Device not found' };
  }

  const unpairedDevice = btData.pairedDevices.splice(index, 1)[0];
  writeBluetoothDevices(btData);

  return { success: true, device: unpairedDevice };
}

/**
 * Get paired devices for user
 */
function getPairedDevices(userId) {
  const btData = readBluetoothDevices();
  return btData.pairedDevices.filter(d => d.userId === userId);
}

/**
 * Simulate real-time data streaming from device
 * In real implementation, this would use BLE GATT characteristics
 */
function streamDeviceData(userId, deviceId) {
  const devices = getPairedDevices(userId);
  const device = devices.find(d => d.deviceId === deviceId);

  if (!device) {
    return { success: false, error: 'Device not paired' };
  }

  // Generate realistic health data based on device type
  const mockData = generateMockHealthData(device);

  return {
    success: true,
    deviceId,
    deviceName: device.deviceName,
    type: device.type,
    data: mockData,
    timestamp: new Date().toISOString(),
    signalStrength: Math.floor(Math.random() * 50) - 100 // RSSI value
  };
}

/**
 * Generate mock health data (simulates real device data)
 */
function generateMockHealthData(device) {
  const data = {
    timestamp: new Date().toISOString()
  };

  // Heart rate
  if (device.supported.includes('heart_rate')) {
    data.heartRate = Math.floor(Math.random() * 40) + 60; // 60-100 BPM
  }

  // Steps today
  if (device.supported.includes('steps')) {
    data.stepsToday = Math.floor(Math.random() * 15000) + 2000; // 2000-17000 steps
    data.walkingHours = (data.stepsToday / 6000).toFixed(2); // Convert steps to hours (approx 6000 steps/hour)
  }

  // Sleep data
  if (device.supported.includes('sleep')) {
    data.lastNightSleep = (Math.random() * 3 + 5).toFixed(1); // 5-8 hours
    data.sleepQuality = Math.floor(Math.random() * 30) + 70; // 70-100%
  }

  // Screen time (from Android/iOS integration)
  if (device.supported.includes('screen_time')) {
    data.screenTime = (Math.random() * 6 + 2).toFixed(1); // 2-8 hours
  }

  // Water intake
  if (device.supported.includes('water_intake')) {
    data.waterIntakeCups = Math.floor(Math.random() * 4) + 6; // 6-10 cups
  }

  // Calories burned
  if (device.supported.includes('calories')) {
    data.caloriesBurned = Math.floor(Math.random() * 1000) + 1500; // 1500-2500 cal
  }

  // VO2 Max (fitness trackers)
  if (device.supported.includes('vo2_max')) {
    data.vo2Max = (Math.random() * 10 + 40).toFixed(1); // 40-50 ml/kg/min
  }

  // Stress level
  if (device.supported.includes('stress')) {
    data.stressLevel = Math.floor(Math.random() * 100); // 0-100
  }

  return data;
}

/**
 * Auto-sync device data to health profile
 */
function autoSyncDeviceData(userId, deviceId, healthDataFile) {
  const btData = readBluetoothDevices();
  const device = btData.pairedDevices.find(d => d.userId === userId && d.deviceId === deviceId);

  if (!device) {
    return { success: false, error: 'Device not found' };
  }

  // Get streaming data
  const streamedData = streamDeviceData(userId, deviceId);
  if (!streamedData.success) {
    return streamedData;
  }

  // Convert device data to health metrics
  const convertedData = convertDeviceDataToHealthMetrics(streamedData.data);

  // Update health data file
  const healthData = JSON.parse(fs.readFileSync(healthDataFile, 'utf8') || '{}');
  
  if (!healthData[userId]) {
    healthData[userId] = {};
  }

  // Merge with existing data
  healthData[userId] = {
    ...healthData[userId],
    ...convertedData,
    lastSyncDevice: {
      deviceId,
      deviceName: device.deviceName,
      timestamp: new Date().toISOString()
    }
  };

  fs.writeFileSync(healthDataFile, JSON.stringify(healthData, null, 2));

  // Log sync
  const syncLog = {
    userId,
    deviceId,
    deviceName: device.deviceName,
    timestamp: new Date().toISOString(),
    dataPoints: Object.keys(convertedData).length,
    status: 'success'
  };

  btData.syncLogs.push(syncLog);
  if (btData.syncLogs.length > 1000) {
    btData.syncLogs = btData.syncLogs.slice(-1000); // Keep last 1000 logs
  }

  writeBluetoothDevices(btData);

  // Update device's last sync time
  device.lastSync = new Date().toISOString();
  writeBluetoothDevices(btData);

  return {
    success: true,
    device: device.deviceName,
    convertedData,
    syncLog
  };
}

/**
 * Convert device-specific data to standard health metrics
 */
function convertDeviceDataToHealthMetrics(deviceData) {
  const converted = {
    lastUpdated: new Date().toISOString()
  };

  // Steps to walking hours
  if (deviceData.walkingHours) {
    converted.walkingHours = parseFloat(deviceData.walkingHours);
  } else if (deviceData.stepsToday) {
    converted.walkingHours = parseFloat((deviceData.stepsToday / 6000).toFixed(2));
  }

  // Sleep data
  if (deviceData.lastNightSleep) {
    converted.avgSleepHours = parseFloat(deviceData.lastNightSleep);
  }

  // Water intake
  if (deviceData.waterIntakeCups) {
    converted.waterGlasses = deviceData.waterIntakeCups;
  } else if (deviceData.waterIntake) {
    converted.waterGlasses = deviceData.waterIntake;
  }

  // Screen time
  if (deviceData.screenTime) {
    converted.screenTimeHours = parseFloat(deviceData.screenTime);
  }

  return converted;
}

/**
 * Enable auto-sync for a device
 */
function enableAutoSync(userId, deviceId, syncIntervalMinutes = 5) {
  const btData = readBluetoothDevices();
  const device = btData.pairedDevices.find(d => d.userId === userId && d.deviceId === deviceId);

  if (!device) {
    return { success: false, error: 'Device not found' };
  }

  device.autoSync = true;
  device.syncInterval = syncIntervalMinutes;

  writeBluetoothDevices(btData);

  return { success: true, device };
}

/**
 * Disable auto-sync for a device
 */
function disableAutoSync(userId, deviceId) {
  const btData = readBluetoothDevices();
  const device = btData.pairedDevices.find(d => d.userId === userId && d.deviceId === deviceId);

  if (!device) {
    return { success: false, error: 'Device not found' };
  }

  device.autoSync = false;
  writeBluetoothDevices(btData);

  return { success: true, device };
}

/**
 * Get device data history
 */
function getDeviceDataHistory(userId, deviceId, limit = 50) {
  const btData = readBluetoothDevices();
  
  const deviceLogs = btData.syncLogs.filter(log => 
    log.userId === userId && log.deviceId === deviceId
  ).slice(-limit);

  return deviceLogs;
}

/**
 * Get sync statistics
 */
function getSyncStatistics(userId) {
  const btData = readBluetoothDevices();
  
  const userLogs = btData.syncLogs.filter(log => log.userId === userId);
  const pairedDevices = btData.pairedDevices.filter(d => d.userId === userId);

  const stats = {
    totalDevicesPaired: pairedDevices.length,
    totalSyncs: userLogs.length,
    lastSyncTime: userLogs.length > 0 ? userLogs[userLogs.length - 1].timestamp : null,
    devicesWithAutoSync: pairedDevices.filter(d => d.autoSync).length,
    syncSuccessRate: userLogs.length > 0 
      ? (userLogs.filter(l => l.status === 'success').length / userLogs.length * 100).toFixed(2)
      : 0
  };

  return stats;
}

module.exports = {
  initializeBluetoothStorage,
  discoverDevices,
  pairDevice,
  unpairDevice,
  getPairedDevices,
  streamDeviceData,
  autoSyncDeviceData,
  enableAutoSync,
  disableAutoSync,
  getDeviceDataHistory,
  getSyncStatistics
};
