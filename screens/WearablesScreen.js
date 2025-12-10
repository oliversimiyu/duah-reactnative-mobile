import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../ThemeContext';

// Feature flag: Set to true when using development build with real BLE support
// For Expo Go, this will use mock data for demonstration
const USE_REAL_BLE = false;

export default function WearablesScreen({ navigation }) {
  const { isDarkMode, colors } = useTheme();
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [syncSteps, setSyncSteps] = useState(true);
  const [syncHeartRate, setSyncHeartRate] = useState(true);
  const [syncSleep, setSyncSleep] = useState(true);

  // Mock device data for Expo Go testing
  const mockDevicePool = [
    {
      id: 'mock-apple-watch-1',
      name: 'Apple Watch Series 9',
      brand: 'Apple',
      type: 'Apple Watch',
      icon: '⌚',
      rssi: -65,
    },
    {
      id: 'mock-galaxy-watch-1',
      name: 'Galaxy Watch 6',
      brand: 'Samsung',
      type: 'Samsung Watch',
      icon: '⌚',
      rssi: -72,
    },
    {
      id: 'mock-fitbit-1',
      name: 'Fitbit Charge 6',
      brand: 'Fitbit',
      type: 'Fitbit',
      icon: '⌚',
      rssi: -58,
    },
    {
      id: 'mock-garmin-1',
      name: 'Garmin Forerunner 265',
      brand: 'Garmin',
      type: 'Garmin',
      icon: '⌚',
      rssi: -80,
    },
    {
      id: 'mock-miband-1',
      name: 'Mi Band 8',
      brand: 'Xiaomi',
      type: 'Mi Band',
      icon: '⌚',
      rssi: -70,
    },
  ];

  const scanForDevices = () => {
    if (USE_REAL_BLE) {
      // Real BLE implementation (for development builds)
      Alert.alert(
        'BLE Not Available',
        'Real BLE scanning requires a development build with react-native-ble-plx. Currently using mock data for demonstration.',
        [{ text: 'OK' }]
      );
    } else {
      // Mock implementation for Expo Go
      scanForMockDevices();
    }
  };

  const scanForMockDevices = () => {
    setIsScanning(true);
    setAvailableDevices([]);

    // Simulate progressive device discovery
    let discoveredCount = 0;
    const interval = setInterval(() => {
      if (discoveredCount < mockDevicePool.length) {
        const device = mockDevicePool[discoveredCount];
        // Ensure all required properties are present
        const safeDevice = {
          id: device.id,
          name: device.name || 'Unknown Device',
          brand: device.brand || 'Unknown',
          type: device.type || 'Smart Watch',
          icon: device.icon || '⌚',
          rssi: device.rssi || -70,
        };
        setAvailableDevices(prev => [...prev, safeDevice]);
        discoveredCount++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        
        if (mockDevicePool.length === 0) {
          Alert.alert(
            'No Devices Found',
            'No wearable devices were found nearby. Make sure your device is powered on and in pairing mode.',
            [{ text: 'OK' }]
          );
        }
      }
    }, 800); // Discover a device every 800ms
  };

  const connectDevice = (deviceInfo) => {
    // Simulate connection delay
    setIsScanning(true);
    
    setTimeout(() => {
      const connectedDevice = {
        ...deviceInfo,
        connected: true,
        battery: Math.floor(Math.random() * 30) + 70, // 70-100%
        lastSync: new Date().toISOString(),
      };

      setConnectedDevices(prev => [...prev, connectedDevice]);
      setAvailableDevices(prev => prev.filter(d => d.id !== deviceInfo.id));
      setIsScanning(false);
      
      Alert.alert('Success', `Connected to ${deviceInfo.name}`);
    }, 1500);
  };

  const disconnectDevice = (deviceId) => {
    const device = connectedDevices.find(d => d.id === deviceId);
    if (!device) return;

    Alert.alert(
      'Disconnect Device',
      `Are you sure you want to disconnect ${device.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setConnectedDevices(prev => prev.filter(d => d.id !== deviceId));
            Alert.alert('Disconnected', `${device.name} has been disconnected`);
          },
        },
      ]
    );
  };

  const syncDevice = (deviceId) => {
    const device = connectedDevices.find(d => d.id === deviceId);
    if (!device) return;

    Alert.alert('Syncing', `Syncing data from ${device.name}...`);
    
    // Simulate sync
    setTimeout(() => {
      setConnectedDevices(prev =>
        prev.map(d =>
          d.id === deviceId
            ? { ...d, lastSync: new Date().toISOString() }
            : d
        )
      );
      Alert.alert('Sync Complete', `Successfully synced data from ${device.name}`);
    }, 2000);
  };

  const formatLastSync = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const renderConnectedDevice = (device) => {
    if (!device || !device.id) {
      return null; // Safety check
    }
    
    return (
      <View key={device.id} style={[styles.deviceCard, { backgroundColor: colors.card }]}>
        <View style={styles.deviceHeader}>
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceIcon}>{device.icon || '⌚'}</Text>
            <View style={styles.deviceDetails}>
              <Text style={[styles.deviceName, { color: colors.text }]}>
                {device.name || 'Unknown Device'}
              </Text>
              <Text style={[styles.deviceType, { color: colors.textSecondary }]}>
                {device.type || 'Smart Watch'}
              </Text>
            </View>
          </View>
        <View style={[styles.connectedBadge, { backgroundColor: colors.success + '20' }]}>
          <View style={[styles.connectedDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.connectedText, { color: colors.success }]}>Connected</Text>
        </View>
      </View>

      <View style={styles.deviceStats}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Battery</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{device.battery}%</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Last Sync</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatLastSync(device.lastSync)}
          </Text>
        </View>
      </View>

      <View style={styles.deviceActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => syncDevice(device.id)}
        >
          <Text style={styles.actionButtonText}>Sync Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.disconnectButton, { backgroundColor: colors.error + '20' }]}
          onPress={() => disconnectDevice(device.id)}
        >
          <Text style={[styles.actionButtonText, { color: colors.error }]}>Disconnect</Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  const renderAvailableDevice = (device) => {
    if (!device || !device.id) {
      return null; // Safety check
    }
    
    return (
      <TouchableOpacity
        key={device.id}
        style={[styles.availableDevice, { backgroundColor: colors.card }]}
        onPress={() => connectDevice(device)}
      >
        <Text style={styles.deviceIcon}>{device.icon || '⌚'}</Text>
        <View style={styles.deviceDetails}>
          <Text style={[styles.deviceName, { color: colors.text }]}>{device.name || 'Unknown Device'}</Text>
          <Text style={[styles.deviceType, { color: colors.textSecondary }]}>
            {device.type || 'Smart Watch'} • Signal: {Math.abs(device.rssi || -70)} dBm
          </Text>
        </View>
        <Text style={[styles.connectText, { color: colors.primary }]}>Connect</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wearables</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        {!USE_REAL_BLE && (
          <View style={[styles.infoBanner, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.infoBannerText, { color: colors.primary }]}>
              ℹ️ Demo Mode: Using mock data. For real BLE support, create a development build with react-native-ble-plx.
            </Text>
          </View>
        )}

        {/* Connected Devices */}
        {connectedDevices.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Connected Devices ({connectedDevices.length})
            </Text>
            {connectedDevices.map(renderConnectedDevice)}
          </View>
        )}

        {/* Sync Settings */}
        {connectedDevices.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sync Settings</Text>
            <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Auto-Sync
                </Text>
                <Switch
                  value={syncEnabled}
                  onValueChange={setSyncEnabled}
                  trackColor={{ false: colors.border, true: colors.primary + '80' }}
                  thumbColor={syncEnabled ? colors.primary : colors.textSecondary}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Sync Steps
                </Text>
                <Switch
                  value={syncSteps}
                  onValueChange={setSyncSteps}
                  trackColor={{ false: colors.border, true: colors.primary + '80' }}
                  thumbColor={syncSteps ? colors.primary : colors.textSecondary}
                  disabled={!syncEnabled}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Sync Heart Rate
                </Text>
                <Switch
                  value={syncHeartRate}
                  onValueChange={setSyncHeartRate}
                  trackColor={{ false: colors.border, true: colors.primary + '80' }}
                  thumbColor={syncHeartRate ? colors.primary : colors.textSecondary}
                  disabled={!syncEnabled}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Sync Sleep Data
                </Text>
                <Switch
                  value={syncSleep}
                  onValueChange={setSyncSleep}
                  trackColor={{ false: colors.border, true: colors.primary + '80' }}
                  thumbColor={syncSleep ? colors.primary : colors.textSecondary}
                  disabled={!syncEnabled}
                />
              </View>
            </View>
          </View>
        )}

        {/* Scan Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.scanButton,
              { backgroundColor: colors.primary },
              isScanning && styles.scanButtonDisabled,
            ]}
            onPress={scanForDevices}
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.scanButtonText}>Scanning...</Text>
              </>
            ) : (
              <Text style={styles.scanButtonText}>🔍 Scan for Devices</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Available Devices */}
        {availableDevices.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Available Devices ({availableDevices.length})
            </Text>
            {availableDevices.map(renderAvailableDevice)}
          </View>
        )}

        {/* Empty State */}
        {connectedDevices.length === 0 && availableDevices.length === 0 && !isScanning && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⌚</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Devices Connected
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Tap "Scan for Devices" to find nearby wearables
            </Text>
          </View>
        )}

        {/* Supported Devices */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Supported Devices
          </Text>
          <View style={[styles.supportedCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.supportedText, { color: colors.textSecondary }]}>
              • Apple Watch{'\n'}
              • Samsung Galaxy Watch{'\n'}
              • Fitbit (Charge, Versa, Sense){'\n'}
              • Garmin (Forerunner, Venu, Fenix){'\n'}
              • Xiaomi Mi Band{'\n'}
              • Huawei Watch{'\n'}
              • Polar{'\n'}
              • Suunto
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    margin: 20,
    padding: 15,
    borderRadius: 12,
  },
  infoBannerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  deviceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 14,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  connectedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deviceStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  disconnectButton: {
    // Additional styles for disconnect button
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  availableDevice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  connectText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsCard: {
    borderRadius: 12,
    padding: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  supportedCard: {
    borderRadius: 12,
    padding: 16,
  },
  supportedText: {
    fontSize: 14,
    lineHeight: 24,
  },
});
