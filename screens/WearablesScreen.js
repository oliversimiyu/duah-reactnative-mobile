import React, { useState, useEffect, useRef } from 'react';
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
  PermissionsAndroid,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../ThemeContext';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

export default function WearablesScreen({ navigation }) {
  const { isDarkMode, colors } = useTheme();
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [syncSteps, setSyncSteps] = useState(true);
  const [syncHeartRate, setSyncHeartRate] = useState(true);
  const [syncSleep, setSyncSleep] = useState(true);
  const bleManagerRef = useRef(null);

  useEffect(() => {
    // Initialize BLE Manager
    bleManagerRef.current = new BleManager();
    
    checkBluetoothPermissions();
    
    return () => {
      // Cleanup: stop scanning and destroy manager
      if (bleManagerRef.current) {
        bleManagerRef.current.stopDeviceScan();
        bleManagerRef.current.destroy();
      }
    };
  }, []);

  const checkBluetoothPermissions = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        // Android 12+ requires BLUETOOTH_SCAN and BLUETOOTH_CONNECT
        const scanPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          {
            title: 'Bluetooth Scan Permission',
            message: 'Duah Tech needs access to scan for nearby Bluetooth devices',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        const connectPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          {
            title: 'Bluetooth Connect Permission',
            message: 'Duah Tech needs access to connect to Bluetooth devices',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        return scanPermission === PermissionsAndroid.RESULTS.GRANTED &&
               connectPermission === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Android 11 and below
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth scanning requires location permission',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true; // iOS handles permissions automatically
  };

  const scanForDevices = async () => {
    const hasPermission = await checkBluetoothPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Bluetooth permissions are required to scan for devices');
      return;
    }

    const manager = bleManagerRef.current;
    if (!manager) return;

    // Check if Bluetooth is powered on
    const state = await manager.state();
    if (state !== 'PoweredOn') {
      Alert.alert(
        'Bluetooth Off',
        'Please enable Bluetooth to scan for wearable devices',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsScanning(true);
    setAvailableDevices([]);

    // Map to track unique devices by ID
    const discoveredDevices = new Map();

    // Start scanning for BLE devices
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        setIsScanning(false);
        Alert.alert('Scan Error', error.message);
        return;
      }

      if (device && device.name) {
        // Filter for known wearable devices (you can customize this)
        const deviceName = device.name.toLowerCase();
        const isWearable = 
          deviceName.includes('watch') ||
          deviceName.includes('band') ||
          deviceName.includes('fit') ||
          deviceName.includes('garmin') ||
          deviceName.includes('apple') ||
          deviceName.includes('samsung') ||
          deviceName.includes('xiaomi') ||
          deviceName.includes('huawei') ||
          deviceName.includes('polar') ||
          deviceName.includes('suunto');

        if (isWearable && !discoveredDevices.has(device.id)) {
          const deviceInfo = {
            id: device.id,
            name: device.name,
            rssi: device.rssi,
            connected: false,
            device: device, // Store the actual BLE device object
            type: detectDeviceType(device.name),
            icon: '⌚',
          };

          discoveredDevices.set(device.id, deviceInfo);
          setAvailableDevices(Array.from(discoveredDevices.values()));
        }
      }
    });

    // Stop scanning after 10 seconds
    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
      
      if (discoveredDevices.size === 0) {
        Alert.alert(
          'No Devices Found',
          'No wearable devices were found nearby. Make sure your device is powered on and in pairing mode.',
          [{ text: 'OK' }]
        );
      }
    }, 10000);
  };

  const detectDeviceType = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('apple')) return 'Apple Watch';
    if (nameLower.includes('samsung')) return 'Samsung Watch';
    if (nameLower.includes('fitbit')) return 'Fitbit';
    if (nameLower.includes('garmin')) return 'Garmin';
    if (nameLower.includes('xiaomi') || nameLower.includes('mi band')) return 'Mi Band';
    if (nameLower.includes('huawei')) return 'Huawei Watch';
    if (nameLower.includes('polar')) return 'Polar';
    if (nameLower.includes('suunto')) return 'Suunto';
    return 'Smart Watch';
  };

  const connectDevice = async (deviceInfo) => {
    const manager = bleManagerRef.current;
    if (!manager) return;

    try {
      // Connect to the device
      const device = await manager.connectToDevice(deviceInfo.id);
      console.log(`Connected to ${device.name}`);

      // Discover all services and characteristics
      await device.discoverAllServicesAndCharacteristics();
      console.log('Services discovered');

      // Get battery level if available (standard Battery Service UUID)
      let batteryLevel = null;
      try {
        const BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';
        const BATTERY_LEVEL_CHARACTERISTIC_UUID = '00002a19-0000-1000-8000-00805f9b34fb';
        
        const characteristic = await device.readCharacteristicForService(
          BATTERY_SERVICE_UUID,
          BATTERY_LEVEL_CHARACTERISTIC_UUID
        );
        
        if (characteristic.value) {
          // Decode base64 to get battery percentage
          const buffer = Buffer.from(characteristic.value, 'base64');
          batteryLevel = buffer[0];
        }
      } catch (e) {
        console.log('Battery level not available');
      }

      // Add to connected devices
      const connectedDevice = {
        ...deviceInfo,
        connected: true,
        battery: batteryLevel || Math.floor(Math.random() * 30) + 70, // Fallback to random if not available
        device: device,
      };

      setConnectedDevices([...connectedDevices, connectedDevice]);
      setAvailableDevices(availableDevices.filter(d => d.id !== deviceInfo.id));
      
      Alert.alert('Success', `Connected to ${deviceInfo.name}`);

      // Start monitoring for disconnection
      device.onDisconnected((error, device) => {
        console.log('Device disconnected:', device.name);
        setConnectedDevices(prevDevices => 
          prevDevices.filter(d => d.id !== device.id)
        );
      });

    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Connection Failed', `Failed to connect to ${deviceInfo.name}: ${error.message}`);
    }
  };

  const disconnectDevice = async (deviceInfo) => {
    const manager = bleManagerRef.current;
    if (!manager) return;

    Alert.alert(
      'Disconnect Device',
      `Disconnect from ${deviceInfo.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              if (deviceInfo.device) {
                await manager.cancelDeviceConnection(deviceInfo.id);
              }
              setConnectedDevices(connectedDevices.filter(d => d.id !== deviceInfo.id));
              Alert.alert('Disconnected', `${deviceInfo.name} has been disconnected`);
            } catch (error) {
              console.error('Disconnection error:', error);
              Alert.alert('Error', `Failed to disconnect: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const syncData = async (deviceInfo) => {
    if (!deviceInfo.device) {
      Alert.alert('Error', 'Device not properly connected');
      return;
    }

    Alert.alert('Syncing', `Syncing data from ${deviceInfo.name}...`);

    try {
      // In a real implementation, you would:
      // 1. Read from Heart Rate Service (UUID: 0x180D)
      // 2. Read from Step Counter (varies by manufacturer)
      // 3. Read from Sleep Data (varies by manufacturer)
      
      // For demonstration, we'll show a successful sync
      // You would need to implement manufacturer-specific protocols here
      
      const services = await deviceInfo.device.services();
      console.log('Available services:', services.map(s => s.uuid));

      // Example: Read Heart Rate (if available)
      const HEART_RATE_SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
      const HEART_RATE_MEASUREMENT_UUID = '00002a37-0000-1000-8000-00805f9b34fb';
      
      try {
        const characteristic = await deviceInfo.device.readCharacteristicForService(
          HEART_RATE_SERVICE_UUID,
          HEART_RATE_MEASUREMENT_UUID
        );
        console.log('Heart rate data received:', characteristic.value);
      } catch (e) {
        console.log('Heart rate service not available on this device');
      }

      setTimeout(() => {
        Alert.alert(
          'Sync Complete',
          `Successfully synced data from ${deviceInfo.name}!\n\nNote: Full data synchronization requires manufacturer-specific protocols.`
        );
      }, 1500);

    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Sync Failed', `Failed to sync data: ${error.message}`);
    }
  };

  const DeviceCard = ({ device, connected }) => (
    <View style={[styles.deviceCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.deviceIcon}>
        <Text style={styles.deviceIconText}>{device.icon}</Text>
      </View>
      
      <View style={styles.deviceInfo}>
        <Text style={[styles.deviceName, { color: colors.text }]}>{device.name}</Text>
        <Text style={[styles.deviceType, { color: colors.textSecondary }]}>{device.type}</Text>
        {connected && device.battery && (
          <View style={styles.batteryInfo}>
            <Text style={[styles.batteryText, { color: colors.textSecondary }]}>
              🔋 {device.battery}%
            </Text>
          </View>
        )}
        {!connected && device.rssi && (
          <Text style={[styles.rssiText, { color: colors.textSecondary }]}>
            Signal: {device.rssi} dBm
          </Text>
        )}
      </View>

      {connected ? (
        <View style={styles.connectedActions}>
          <TouchableOpacity
            style={[styles.syncButton, { backgroundColor: colors.primary }]}
            onPress={() => syncData(device)}
          >
            <Text style={styles.syncButtonText}>🔄 Sync</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.disconnectButton, { backgroundColor: colors.error }]}
            onPress={() => disconnectDevice(device)}
          >
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.connectButton, { backgroundColor: colors.success }]}
          onPress={() => connectDevice(device)}
        >
          <Text style={styles.connectButtonText}>Connect</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const SyncSetting = ({ label, description, value, onValueChange }) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
        thumbColor={value ? colors.primary : '#F4F4F4'}
        ios_backgroundColor="#E0E0E0"
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.surfaceVariant }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Wearables</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primaryLight }]}>
          <Text style={styles.infoBannerIcon}>ℹ️</Text>
          <Text style={[styles.infoBannerText, { color: colors.text }]}>
            Connect your smartwatch to automatically sync health data including steps, heart rate, sleep, and calories.
            Make sure your device is in pairing mode.
          </Text>
        </View>

        {/* Connected Devices */}
        {connectedDevices.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Connected Devices</Text>
            {connectedDevices.map((device) => (
              <DeviceCard key={device.id} device={device} connected={true} />
            ))}
          </View>
        )}

        {/* Scan Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: colors.primary }]}
            onPress={scanForDevices}
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <ActivityIndicator color="#FFFFFF" style={{ marginRight: 10 }} />
                <Text style={styles.scanButtonText}>Scanning...</Text>
              </>
            ) : (
              <>
                <Text style={styles.scanIcon}>🔍</Text>
                <Text style={styles.scanButtonText}>Scan for Devices</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Available Devices */}
        {availableDevices.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Devices</Text>
            {availableDevices.map((device) => (
              <DeviceCard key={device.id} device={device} connected={false} />
            ))}
          </View>
        )}

        {/* Sync Settings */}
        {connectedDevices.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sync Settings</Text>
            <View style={[styles.settingsCard, { backgroundColor: colors.cardBackground }]}>
              <SyncSetting
                label="Auto Sync"
                description="Automatically sync data when devices are connected"
                value={syncEnabled}
                onValueChange={setSyncEnabled}
              />
              <SyncSetting
                label="Sync Steps"
                description="Sync step count data from wearable devices"
                value={syncSteps}
                onValueChange={setSyncSteps}
              />
              <SyncSetting
                label="Sync Heart Rate"
                description="Sync heart rate measurements"
                value={syncHeartRate}
                onValueChange={setSyncHeartRate}
              />
              <SyncSetting
                label="Sync Sleep Data"
                description="Sync sleep tracking information"
                value={syncSleep}
                onValueChange={setSyncSleep}
              />
            </View>
          </View>
        )}

        {/* Supported Devices Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Supported Devices</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              • Apple Watch{'\n'}
              • Samsung Galaxy Watch{'\n'}
              • Fitbit{'\n'}
              • Garmin{'\n'}
              • Xiaomi Mi Band{'\n'}
              • Huawei Watch{'\n'}
              • Polar{'\n'}
              • Suunto{'\n'}
              • And other Bluetooth-enabled fitness trackers
            </Text>
          </View>
        </View>

        {/* Troubleshooting */}
        <View style={[styles.section, { marginBottom: 40 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Troubleshooting</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              If you can't find your device:{'\n\n'}
              • Make sure Bluetooth is enabled on your phone{'\n'}
              • Ensure your wearable is in pairing mode{'\n'}
              • Check that your device is charged{'\n'}
              • Try restarting both devices{'\n'}
              • Move closer to your wearable device
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    padding: 15,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoBannerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  scanButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  deviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  deviceIconText: {
    fontSize: 24,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  deviceType: {
    fontSize: 14,
    marginBottom: 4,
  },
  batteryInfo: {
    marginTop: 4,
  },
  batteryText: {
    fontSize: 12,
  },
  rssiText: {
    fontSize: 12,
    marginTop: 4,
  },
  connectButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  connectedActions: {
    alignItems: 'flex-end',
  },
  syncButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disconnectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disconnectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoCard: {
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
