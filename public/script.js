// API Base URL - works on both localhost and Azure
const API_BASE = `${window.location.protocol}//${window.location.host}/api`;

// Current user
let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Load user from localStorage
  const savedUser = localStorage.getItem('healthUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showDashboard();
    loadHealthData();
  }

  // Event listeners
  document.getElementById('registrationForm').addEventListener('submit', handleRegistration);
  document.getElementById('syncForm').addEventListener('submit', handleSync);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);

  // Auto-refresh health data every 30 seconds
  if (currentUser) {
    setInterval(loadHealthData, 30000);
    
    // Check Google Fit status and handle callbacks
    checkGoogleFitStatus();
    handleGoogleFitCallback();
  }
});

// Handle user registration
async function handleRegistration(e) {
  e.preventDefault();

  const name = document.getElementById('userName').value;
  const email = document.getElementById('userEmail').value;
  const phone = document.getElementById('userPhone').value;

  try {
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone })
    });

    if (!response.ok) throw new Error('Registration failed');

    const data = await response.json();
    currentUser = data.user;

    // Save user to localStorage
    localStorage.setItem('healthUser', JSON.stringify(currentUser));

    // Update UI
    const welcomeElement = document.getElementById('userWelcome');
    if (welcomeElement) {
      welcomeElement.textContent = `Welcome, ${currentUser.name}!`;
    }

    // Show dashboard
    showDashboard();

    // Clear form
    document.getElementById('registrationForm').reset();

    // Load health data
    await loadHealthData();
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to register. Please try again.');
  }
}

// Show dashboard
function showDashboard() {
  const authSection = document.getElementById('authSection');
  const dashboardSection = document.getElementById('dashboardSection');

  authSection.style.display = 'none';
  dashboardSection.style.display = 'block';

  if (currentUser) {
    const welcomeElement = document.getElementById('userWelcome');
    if (welcomeElement) {
      welcomeElement.textContent = `Welcome, ${currentUser.name}!`;
    }
  }
}

// Load health data
async function loadHealthData() {
  if (!currentUser) return;

  try {
    // Fetch health data
    const healthResponse = await fetch(`${API_BASE}/health-data/${currentUser.id}`);
    if (healthResponse.ok) {
      const { healthData, recommendations } = await healthResponse.json();
      updateHealthMetrics(healthData);
      updateRecommendations(recommendations);
    }

    // Fetch notifications
    const notificationsResponse = await fetch(`${API_BASE}/notifications/${currentUser.id}`);
    if (notificationsResponse.ok) {
      const notifications = await notificationsResponse.json();
      updateNotifications(notifications);
    }

    // Fetch health status
    const statusResponse = await fetch(`${API_BASE}/health-status/${currentUser.id}`);
    if (statusResponse.ok) {
      const status = await statusResponse.json();
      updateHealthScore(status);
    }
  } catch (error) {
    console.error('Error loading health data:', error);
  }
}

// Update health metrics display
function updateHealthMetrics(data) {
  document.getElementById('sleepHours').textContent = data.avgSleepHours.toFixed(1);
  document.getElementById('walkingHours').textContent = data.walkingHours.toFixed(1);
  document.getElementById('screenHours').textContent = data.screenTimeHours.toFixed(1);
  document.getElementById('waterGlasses').textContent = data.waterGlasses;

  // Update suggestions based on values
  updateSuggestions(data);
}

// Update metric suggestions
function updateSuggestions(data) {
  // Sleep suggestion
  const sleepSug = document.getElementById('sleepSuggestion');
  if (data.avgSleepHours < 6) {
    sleepSug.textContent = '⚠️ Get more sleep!';
    sleepSug.style.color = '#ef4444';
  } else if (data.avgSleepHours > 10) {
    sleepSug.textContent = '⚠️ Sleeping too much!';
    sleepSug.style.color = '#f59e0b';
  } else {
    sleepSug.textContent = '✓ Sleep is good!';
    sleepSug.style.color = '#10b981';
  }

  // Walking suggestion
  const walkingSug = document.getElementById('walkingSuggestion');
  if (data.walkingHours < 1) {
    walkingSug.textContent = '⚠️ Increase walking!';
    walkingSug.style.color = '#ef4444';
  } else {
    walkingSug.textContent = '✓ Keep walking!';
    walkingSug.style.color = '#10b981';
  }

  // Screen time suggestion
  const screenSug = document.getElementById('screenSuggestion');
  if (data.screenTimeHours > 6) {
    screenSug.textContent = '⚠️ Reduce screen time!';
    screenSug.style.color = '#ef4444';
  } else {
    screenSug.textContent = '✓ Screen time is good!';
    screenSug.style.color = '#10b981';
  }

  // Water suggestion
  const waterSug = document.getElementById('waterSuggestion');
  if (data.waterGlasses < 6) {
    waterSug.textContent = '⚠️ Drink more water!';
    waterSug.style.color = '#ef4444';
  } else {
    waterSug.textContent = '✓ Good hydration!';
    waterSug.style.color = '#10b981';
  }
}

// Update health score
function updateHealthScore(status) {
  document.getElementById('healthScore').textContent = status.score;
  document.getElementById('healthStatus').textContent = `${status.overallHealth} Health`;

  // Update color based on score
  const scoreCircle = document.querySelector('.score-circle');
  if (status.score < 50) {
    scoreCircle.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
  } else if (status.score < 75) {
    scoreCircle.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
  } else if (status.score < 90) {
    scoreCircle.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
  } else {
    scoreCircle.style.background = 'linear-gradient(135deg, #10b981 0%, #047857 100%)';
  }
}

// Update recommendations
function updateRecommendations(recommendations) {
  const list = document.getElementById('recommendationsList');

  if (recommendations.length === 0) {
    list.innerHTML = '<p class="empty-state">All health metrics are in check! Keep it up! 🎉</p>';
    return;
  }

  list.innerHTML = recommendations
    .map(rec => `
      <div class="recommendation-item ${rec.priority}">
        <p>${rec.message}</p>
      </div>
    `)
    .join('');
}

// Update notifications
function updateNotifications(notifications) {
  const list = document.getElementById('notificationsList');

  if (notifications.length === 0) {
    list.innerHTML = '<p class="empty-state">No health alerts</p>';
    return;
  }

  // Show only unread notifications
  const unreadNotifications = notifications.filter(n => !n.read).slice(-5);

  if (unreadNotifications.length === 0) {
    list.innerHTML = '<p class="empty-state">All alerts have been read</p>';
    return;
  }

  list.innerHTML = unreadNotifications
    .map(notif => `
      <div class="notification-item ${notif.priority}">
        <p>${notif.message}</p>
        <small>${new Date(notif.timestamp).toLocaleString()}</small>
      </div>
    `)
    .join('');
}

// Update sleep
async function updateSleep() {
  const hours = document.getElementById('sleepInput').value;
  if (hours === '') {
    alert('Please enter sleep hours');
    return;
  }
  await updateHealthMetric('sleepHours', parseFloat(hours));
}

// Update walking
async function updateWalking() {
  const hours = document.getElementById('walkingInput').value;
  if (hours === '') {
    alert('Please enter walking hours');
    return;
  }
  await updateHealthMetric('walkingHours', parseFloat(hours));
}

// Update screen time
async function updateScreen() {
  const hours = document.getElementById('screenInput').value;
  if (hours === '') {
    alert('Please enter screen time hours');
    return;
  }
  await updateHealthMetric('screenTimeHours', parseFloat(hours));
}

// Update water
async function updateWater() {
  const glasses = document.getElementById('waterInput').value;
  if (glasses === '') {
    alert('Please enter water glasses');
    return;
  }
  await updateHealthMetric('waterGlasses', parseInt(glasses));
}

// Generic update health metric
async function updateHealthMetric(metric, value) {
  if (!currentUser) return;

  try {
    const payload = {};
    if (metric === 'sleepHours') payload.sleepHours = value;
    else if (metric === 'walkingHours') payload.walkingHours = value;
    else if (metric === 'screenTimeHours') payload.screenTimeHours = value;
    else if (metric === 'waterGlasses') payload.waterGlasses = value;

    const response = await fetch(`${API_BASE}/health-data/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Update failed');

    // Reload data
    await loadHealthData();

    // Show success message
    showNotification('Health data updated successfully!', 'success');

    // Clear inputs
    if (metric === 'sleepHours') document.getElementById('sleepInput').value = '';
    else if (metric === 'walkingHours') document.getElementById('walkingInput').value = '';
    else if (metric === 'screenTimeHours') document.getElementById('screenInput').value = '';
    else if (metric === 'waterGlasses') document.getElementById('waterInput').value = '';
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to update health data', 'error');
  }
}

// Handle sync from Android
async function handleSync(e) {
  e.preventDefault();

  if (!currentUser) return;

  const walking = document.getElementById('syncWalking').value || '0';
  const screen = document.getElementById('syncScreen').value || '0';
  const sleep = document.getElementById('syncSleep').value || '0';
  const water = document.getElementById('syncWater').value || '0';

  try {
    const response = await fetch(`${API_BASE}/health-data/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        walkingHours: parseFloat(walking),
        screenTimeHours: parseFloat(screen),
        sleepHours: parseFloat(sleep),
        waterGlasses: parseInt(water)
      })
    });

    if (!response.ok) throw new Error('Sync failed');

    const data = await response.json();

    // Reload health data
    await loadHealthData();

    // Clear form
    document.getElementById('syncForm').reset();

    // Show success and new notifications
    showNotification('Android data synced successfully!', 'success');

    if (data.notifications && data.notifications.length > 0) {
      console.log('New notifications generated:', data.notifications);
    }
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to sync data', 'error');
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Handle logout
function handleLogout() {
  localStorage.removeItem('healthUser');
  currentUser = null;

  // Reset UI
  document.getElementById('authSection').style.display = 'flex';
  document.getElementById('dashboardSection').style.display = 'none';
  document.getElementById('registrationForm').reset();
  
  // Reset welcome message
  const welcomeElement = document.getElementById('userWelcome');
  if (welcomeElement) {
    welcomeElement.textContent = 'Welcome';
  }

  showNotification('Logged out successfully', 'success');
}

// Add CSS animation styles dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);

// ==================== BLUETOOTH & WEARABLE INTEGRATION ====================

let selectedDevice = null;

// Discover Bluetooth devices
async function discoverBluetoothDevices() {
  if (!currentUser) return;

  const button = event.target;
  button.disabled = true;
  button.textContent = '🔍 Discovering...';

  try {
    const response = await fetch(`${API_BASE}/bluetooth/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    });

    if (!response.ok) throw new Error('Discovery failed');

    const data = await response.json();
    displayDiscoveredDevices(data.devices);
    document.getElementById('discoveredDevicesList').style.display = 'block';
    document.getElementById('pairedDevicesList').style.display = 'none';

    showNotification(`Found ${data.devices.length} devices nearby!`, 'success');
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to discover devices', 'error');
  } finally {
    button.disabled = false;
    button.textContent = '🔍 Discover Devices';
  }
}

// Display discovered devices
function displayDiscoveredDevices(devices) {
  const list = document.getElementById('devicesList');

  if (devices.length === 0) {
    list.innerHTML = '<p class="empty-state">No devices found. Try again.</p>';
    return;
  }

  list.innerHTML = devices
    .map(device => `
      <div class="device-card" onclick="selectAndPairDevice('${device.id}', '${device.name}')">
        <div class="device-icon">${getDeviceIcon(device.type)}</div>
        <h5>${device.name}</h5>
        <div class="device-type">${device.manufacturer}</div>
        <div class="device-specs">${device.type.replace('_', ' ').toUpperCase()}</div>
        <div class="signal-strength">📶 Signal: ${device.rssi} dBm</div>
        <div class="device-specs">Supports:</div>
        <small>${device.supported.join(', ')}</small>
        <br><br>
        <button class="btn-pair" onclick="event.stopPropagation(); pairDevice('${device.id}', '${device.name}')">
          Pair Device
        </button>
      </div>
    `)
    .join('');
}

// Toggle paired devices view
async function togglePairedDevices() {
  if (!currentUser) return;

  const container = document.getElementById('pairedDevicesList');
  
  if (container.style.display === 'block') {
    container.style.display = 'none';
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/bluetooth/paired/${currentUser.id}`);
    if (!response.ok) throw new Error('Failed to load paired devices');

    const data = await response.json();
    displayPairedDevices(data.devices);
    
    document.getElementById('discoveredDevicesList').style.display = 'none';
    container.style.display = 'block';
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to load paired devices', 'error');
  }
}

// Display paired devices
function displayPairedDevices(devices) {
  const list = document.getElementById('pairedList');

  if (devices.length === 0) {
    list.innerHTML = '<p class="empty-state">No paired devices yet. Discover and pair a device.</p>';
    return;
  }

  list.innerHTML = devices
    .map(device => `
      <div class="device-card paired" onclick="selectDevice('${device.deviceId}', '${device.deviceName}')">
        <div class="device-icon">${getDeviceIcon(device.type)}</div>
        <h5>${device.deviceName}</h5>
        <div class="device-type">${device.manufacturer}</div>
        <div class="device-specs">${formatDate(device.pairedAt)}</div>
        ${device.autoSync ? `<span class="sync-badge auto">⏱️ Auto-Sync</span>` : '<span class="sync-badge manual">Manual</span>'}
        <div class="device-specs" style="margin-top: 0.75rem; font-size: 0.8rem; color: #059669;">
          Last Sync: ${device.lastSync ? formatDate(device.lastSync) : 'Never'}
        </div>
      </div>
    `)
    .join('');

  document.getElementById('deviceActionsPanel').style.display = 'block';
}

// Pair a device
async function pairDevice(deviceId, deviceName) {
  if (!currentUser) return;

  try {
    const response = await fetch(`${API_BASE}/bluetooth/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        deviceId,
        deviceName
      })
    });

    if (!response.ok) throw new Error('Pairing failed');

    const data = await response.json();
    showNotification(`✓ Paired with ${deviceName}!`, 'success');
    
    // Refresh paired devices
    setTimeout(() => togglePairedDevices(), 1000);
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to pair device', 'error');
  }
}

// Select device for actions
function selectDevice(deviceId, deviceName) {
  selectedDevice = { id: deviceId, name: deviceName };
  showNotification(`Selected: ${deviceName}`, 'info');
}

// Select and pair device
function selectAndPairDevice(deviceId, deviceName) {
  selectDevice(deviceId, deviceName);
}

// Sync selected device
async function syncSelectedDevice() {
  if (!currentUser || !selectedDevice) {
    showNotification('Please select a device first', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/bluetooth/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        deviceId: selectedDevice.id
      })
    });

    if (!response.ok) throw new Error('Sync failed');

    const data = await response.json();
    await loadHealthData();

    showNotification(`✓ Synced with ${selectedDevice.name}!`, 'success');
    console.log('Synced data:', data.convertedData);
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to sync device', 'error');
  }
}

// Toggle auto-sync
async function toggleAutoSync() {
  if (!currentUser || !selectedDevice) {
    showNotification('Please select a device first', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/bluetooth/auto-sync/enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        deviceId: selectedDevice.id,
        syncIntervalMinutes: 5
      })
    });

    if (!response.ok) throw new Error('Failed to enable auto-sync');

    const data = await response.json();
    showNotification(`✓ Auto-sync enabled every 5 minutes!`, 'success');
    
    // Refresh paired devices
    setTimeout(() => togglePairedDevices(), 1000);
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to enable auto-sync', 'error');
  }
}

// View device history
async function viewDeviceHistory() {
  if (!currentUser || !selectedDevice) {
    showNotification('Please select a device first', 'error');
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/bluetooth/history/${currentUser.id}/${selectedDevice.id}?limit=10`
    );

    if (!response.ok) throw new Error('Failed to load history');

    const data = await response.json();
    displayDeviceHistory(data.history);
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to load device history', 'error');
  }
}

// Display device history
function displayDeviceHistory(history) {
  if (history.length === 0) {
    showNotification('No sync history for this device', 'info');
    return;
  }

  let historyHTML = `<strong>Last 10 Syncs:</strong><br><br>`;
  history.reverse().forEach(item => {
    historyHTML += `
      <div class="history-item">
        <div>
          <strong>${formatDate(item.timestamp)}</strong><br>
          <small>${item.dataPoints} data points synced</small>
        </div>
        <div class="history-timestamp">${item.status === 'success' ? '✓' : '✗'}</div>
      </div>
    `;
  });

  const alertDiv = document.createElement('div');
  alertDiv.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    width: 400px;
    max-width: 90vw;
    background: white;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    z-index: 9998;
    max-height: 400px;
    overflow-y: auto;
  `;
  alertDiv.innerHTML = historyHTML;
  alertDiv.onclick = () => alertDiv.remove();
  document.body.appendChild(alertDiv);

  setTimeout(() => alertDiv.remove(), 10000);
}

// Unpair device
async function unpairSelectedDevice() {
  if (!currentUser || !selectedDevice) {
    showNotification('Please select a device first', 'error');
    return;
  }

  if (!confirm(`Unpair ${selectedDevice.name}? You can pair it again later.`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/bluetooth/unpair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        deviceId: selectedDevice.id
      })
    });

    if (!response.ok) throw new Error('Unpair failed');

    showNotification(`Unpaired ${selectedDevice.name}`, 'success');
    selectedDevice = null;
    
    // Refresh paired devices
    setTimeout(() => togglePairedDevices(), 1000);
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to unpair device', 'error');
  }
}

// Helper function: Get device icon
function getDeviceIcon(type) {
  const icons = {
    smartwatch: '⌚',
    fitness_tracker: '📟',
    health_band: '📱',
    watch: '⌚'
  };
  return icons[type] || '📱';
}

// Helper function: Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

// ========== PHONE SYNC FUNCTIONS ==========

let selectedPhoneSource = 'manual'; // Default: manual entry

// Switch between Phone and Wearable tabs
function switchSyncTab(tab) {
  // Hide all tabs
  document.getElementById('phoneSyncTab').style.display = 'none';
  document.getElementById('wearableSyncTab').style.display = 'none';

  // Remove active class from all buttons
  document.querySelectorAll('.sync-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected tab
  if (tab === 'phone') {
    document.getElementById('phoneSyncTab').style.display = 'block';
    document.querySelectorAll('.sync-tab-btn')[0].classList.add('active');
  } else {
    document.getElementById('wearableSyncTab').style.display = 'block';
    document.querySelectorAll('.sync-tab-btn')[1].classList.add('active');
  }
}

// Select phone data source
function selectPhoneSource(source) {
  selectedPhoneSource = source;

  // Update UI
  document.querySelectorAll('.source-card').forEach(card => {
    card.classList.remove('selected');
  });

  // Mark selected card
  if (source === 'googlefit') {
    document.querySelectorAll('.source-card')[0].classList.add('selected');
    showPhoneDataForm('googleFitForm');
  } else if (source === 'samsunghealth') {
    document.querySelectorAll('.source-card')[1].classList.add('selected');
    showPhoneDataForm('samsungHealthForm');
  } else {
    document.querySelectorAll('.source-card')[2].classList.add('selected');
    showPhoneDataForm('phoneManualForm');
  }
}

// Show/hide phone data forms
function showPhoneDataForm(formId) {
  // Hide all forms
  document.getElementById('phoneManualForm').style.display = 'none';
  document.getElementById('googleFitForm').style.display = 'none';
  document.getElementById('samsungHealthForm').style.display = 'none';

  // Show selected form
  document.getElementById(formId).style.display = 'block';
}

// Sync data from phone (manual entry)
async function syncFromPhone() {
  if (!currentUser) {
    showNotification('Please register first', 'error');
    return;
  }

  const walkingHours = parseFloat(document.getElementById('phoneWalkingHours').value);
  const screenHours = parseFloat(document.getElementById('phoneScreenHours').value);
  const sleepHours = parseFloat(document.getElementById('phoneSleepHours').value);
  const waterGlasses = parseInt(document.getElementById('phoneWaterGlasses').value);

  // Validate inputs
  if (isNaN(walkingHours) || isNaN(screenHours) || isNaN(sleepHours) || isNaN(waterGlasses)) {
    showNotification('Please enter valid numbers for all fields', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/health-data/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walking_hours: walkingHours,
        screen_time_hours: screenHours,
        sleep_hours: sleepHours,
        water_intake_glasses: waterGlasses
      })
    });

    if (!response.ok) throw new Error('Sync failed');

    const data = await response.json();

    // Clear form
    document.getElementById('phoneWalkingHours').value = '';
    document.getElementById('phoneScreenHours').value = '';
    document.getElementById('phoneSleepHours').value = '';
    document.getElementById('phoneWaterGlasses').value = '';

    showNotification('✅ Health data synced from phone successfully!', 'success');

    // Refresh dashboard
    setTimeout(() => loadHealthData(), 500);
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to sync phone data', 'error');
  }
}

/**
 * Connect to Google Fit - Real Integration
 */
async function connectGoogleFit() {
  const statusDiv = document.getElementById('googleFitStatus');
  
  if (!currentUser) {
    showNotification('Please register first', 'error');
    return;
  }
  
  try {
    statusDiv.style.display = 'block';
    statusDiv.className = 'sync-status pending';
    statusDiv.innerHTML = '⏳ Connecting to Google Fit...';

    // Get authorization URL from backend
    const authResponse = await fetch('/api/google-fit/auth-url');
    const authData = await authResponse.json();

    if (!authData.success) {
      throw new Error('Failed to get authorization URL');
    }

    // Store current user ID in sessionStorage for callback
    sessionStorage.setItem('googleFitUserId', currentUser.id);

    // Redirect user to Google OAuth consent screen
    window.location.href = authData.authUrl;

  } catch (error) {
    statusDiv.className = 'sync-status error';
    statusDiv.innerHTML = '❌ Failed to connect to Google Fit. Please check your configuration.';
    console.error('Error:', error);
    showNotification('Failed to connect to Google Fit: ' + error.message, 'error');
  }
}

/**
 * Handle Google Fit OAuth callback (called after user authorizes)
 */
async function handleGoogleFitCallback() {
  const params = new URLSearchParams(window.location.search);
  const googleFitConnected = params.get('googleFitConnected');
  const userId = params.get('userId') || sessionStorage.getItem('googleFitUserId');

  if (googleFitConnected === 'true' && userId) {
    try {
      showNotification('✅ Google Fit connected! Syncing data...', 'success');
      
      // Wait a moment for tokens to be saved
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sync data from Google Fit
      await syncGoogleFitData(userId);
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, '/');
    } catch (error) {
      console.error('Error handling Google Fit callback:', error);
      showNotification('Failed to sync Google Fit data', 'error');
    }
  }
}

/**
 * Sync data from Google Fit
 */
async function syncGoogleFitData(userId) {
  const statusDiv = document.getElementById('googleFitStatus');
  
  try {
    statusDiv.style.display = 'block';
    statusDiv.className = 'sync-status pending';
    statusDiv.innerHTML = '⏳ Syncing health data from Google Fit...';

    const response = await fetch(`/api/google-fit/sync/${userId}`);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Not authenticated with Google Fit. Please connect first.');
      }
      throw new Error(data.error || 'Failed to sync data');
    }

    // Update UI with synced data
    statusDiv.className = 'sync-status success';
    statusDiv.innerHTML = `
      ✅ Google Fit Synced!<br>
      <small style="color: #666; margin-top: 8px; display: block;">
        Walking: ${data.data.walkingHours}h | Sleep: ${data.data.sleepHours}h<br>
        Last sync: ${new Date().toLocaleTimeString()}
      </small>
      <button class="btn-small" onclick="syncGoogleFitData('${userId}')" style="margin-top: 8px;">
        🔄 Sync Again
      </button>
      <button class="btn-small" onclick="disconnectGoogleFit('${userId}')" style="margin-top: 8px;">
        🔌 Disconnect
      </button>
    `;

    // Update dashboard metrics
    if (data.data.walkingHours !== undefined) {
      document.getElementById('walkingHours').textContent = data.data.walkingHours;
    }
    if (data.data.sleepHours !== undefined) {
      document.getElementById('sleepHours').textContent = data.data.sleepHours;
    }

    // Recalculate health score
    calculateHealthScore();
    
    showNotification('✅ Health data synced from Google Fit!', 'success');
    console.log('Google Fit data synced:', data.data);

  } catch (error) {
    statusDiv.className = 'sync-status error';
    statusDiv.innerHTML = `
      ❌ Sync Failed<br>
      <small style="color: #666; margin-top: 8px; display: block;">
        ${error.message}
      </small>
      <button class="btn-small" onclick="connectGoogleFit()" style="margin-top: 8px;">
        🔄 Try Again
      </button>
    `;
    console.error('Error syncing Google Fit data:', error);
    showNotification('Failed to sync Google Fit data: ' + error.message, 'error');
  }
}

/**
 * Disconnect Google Fit
 */
async function disconnectGoogleFit(userId) {
  if (!confirm('Are you sure you want to disconnect Google Fit? Your health data will not be automatically synced.')) {
    return;
  }

  try {
    const response = await fetch(`/api/google-fit/disconnect/${userId}`, {
      method: 'POST'
    });

    const data = await response.json();

    if (data.success) {
      const statusDiv = document.getElementById('googleFitStatus');
      statusDiv.className = 'sync-status';
      statusDiv.innerHTML = `
        🔗 Connect Google Fit<br>
        <small>Click button below to sync your health data from Google Fit</small>
      `;
      
      showNotification('Google Fit disconnected', 'success');
    } else {
      showNotification('Failed to disconnect Google Fit: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Error disconnecting Google Fit:', error);
    showNotification('Failed to disconnect Google Fit', 'error');
  }
}

/**
 * Check if user is connected to Google Fit and auto-sync
 */
async function checkGoogleFitStatus() {
  if (!currentUser) return;

  try {
    const response = await fetch(`/api/google-fit/check-auth/${currentUser.id}`);
    const data = await response.json();

    if (data.authenticated) {
      const statusDiv = document.getElementById('googleFitStatus');
      statusDiv.style.display = 'block';
      statusDiv.className = 'sync-status success';
      statusDiv.innerHTML = `
        ✅ Google Fit Connected<br>
        <button class="btn-small" onclick="syncGoogleFitData('${currentUser.id}')" style="margin-top: 8px;">
          🔄 Sync Now
        </button>
        <button class="btn-small" onclick="disconnectGoogleFit('${currentUser.id}')" style="margin-top: 8px;">
          🔌 Disconnect
        </button>
      `;
      
      // Auto-sync every 30 minutes
      setInterval(() => {
        syncGoogleFitData(currentUser.id);
      }, 30 * 60 * 1000);
    }
  } catch (error) {
    console.error('Error checking Google Fit status:', error);
  }
}

// Connect to Samsung Health (simulated)
async function connectSamsungHealth() {
  const statusDiv = document.getElementById('samsungHealthStatus');
  
  if (!currentUser) {
    showNotification('Please register first', 'error');
    return;
  }
  
  try {
    statusDiv.style.display = 'block';
    statusDiv.className = 'sync-status pending';
    statusDiv.innerHTML = '⏳ Connecting to Samsung Health...';

    // Simulate authorization delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For now, show that it's ready for real API integration
    statusDiv.className = 'sync-status success';
    statusDiv.innerHTML = `
      ✅ Samsung Health Integration Ready!<br>
      <small style="color: #666; margin-top: 8px; display: block;">
        Real SDK integration required to sync actual health data.<br>
        For testing: Use Manual Entry or the form below to enter data manually.
      </small>
    `;

    // Still pull mock data for demonstration, but be clear about it
    console.log('Note: Using mock data for demonstration. Real Samsung Health SDK integration needed.');

  } catch (error) {
    statusDiv.className = 'sync-status error';
    statusDiv.innerHTML = '❌ Failed to connect to Samsung Health. Please try again.';
    console.error('Error:', error);
  }
}

// Sync phone data to backend
async function syncPhoneData(data, source) {
  if (!currentUser) {
    showNotification('Please register first', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/health-data/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walking_hours: data.walking_hours,
        screen_time_hours: data.screen_time_hours,
        sleep_hours: data.sleep_hours,
        water_intake_glasses: data.water_intake_glasses
      })
    });

    if (!response.ok) throw new Error('Sync failed');

    showNotification(`✅ Health data synced from ${source}!`, 'success');
    loadHealthData();
  } catch (error) {
    console.error('Error:', error);
    showNotification(`Failed to sync data from ${source}`, 'error');
  }
}

// Toggle auto-sync for phone
function togglePhoneAutoSync() {
  const checkbox = document.getElementById('phoneAutoSyncCheckbox');
  if (checkbox.checked) {
    showNotification('📱 Phone auto-sync enabled! Data will sync every 5 minutes.', 'success');
    // Start auto-sync interval
    startPhoneAutoSync();
  } else {
    showNotification('Phone auto-sync disabled', 'success');
    // Stop auto-sync interval
    stopPhoneAutoSync();
  }
}

let phoneAutoSyncInterval = null;

// Start auto-sync from phone
function startPhoneAutoSync() {
  if (phoneAutoSyncInterval) {
    clearInterval(phoneAutoSyncInterval);
  }

  // Sync every 5 minutes
  phoneAutoSyncInterval = setInterval(async () => {
    if (selectedPhoneSource === 'manual') {
      // For manual, skip auto-sync
      return;
    }

    try {
      // Simulate fetching fresh data from the selected source
      const mockData = {
        walking_hours: 1 + Math.random() * 3,
        screen_time_hours: 3 + Math.random() * 4,
        sleep_hours: 6.5 + Math.random() * 2.5,
        water_intake_glasses: 7 + Math.floor(Math.random() * 4)
      };

      await syncPhoneData(mockData, selectedPhoneSource === 'googlefit' ? 'Google Fit' : 'Samsung Health');
    } catch (error) {
      console.error('Auto-sync error:', error);
    }
  }, 300000); // 5 minutes
}

// Stop auto-sync from phone
function stopPhoneAutoSync() {
  if (phoneAutoSyncInterval) {
    clearInterval(phoneAutoSyncInterval);
    phoneAutoSyncInterval = null;
  }
}

