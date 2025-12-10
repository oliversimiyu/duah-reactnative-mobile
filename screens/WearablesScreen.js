import React, { useState, useEffect } from 'react';
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

export default function WearablesScreen({ navigation }) {
  const { isDarkMode, colors } = useTheme();
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [syncEnabled, setSyncEnabled] = useState(true);

  // Simulated wearable devices
  const mockWearables = [
    { id: '1', name: 'Apple Watch Series 9', type: 'Apple Watch', battery: 85, connected: false, icon: '⌚' },
    { id: '2', name: 'Samsung Galaxy Watch 6', type: 'Samsung Watch', battery: 72, connected: false, icon: '⌚' },
    { id: '3', name: 'Fitbit Charge 6', type: 'Fitbit', battery: 65, connected: false, icon: '⌚' },
    { id: '4', name: 'Garmin Forerunner 965', type: 'Garmin', battery: 90, connected: false, icon: '⌚' },
    { id: '5', name: 'Xiaomi Mi Band 8', type: 'Mi Band', battery: 78, connected: false, icon: '⌚' },
    { id: '6', name: 'Huawei Watch GT 4', type: 'Huawei Watch', battery: 88, connected: false, icon: '⌚' },
  ];

  useEffect(() => {
    // Load saved connections from storage
    loadConnectedDevices();
  }, []);

  const loadConnectedDevices = () => {
    // In production, load from AsyncStorage
    // For now, simulate loading
    console.log('Loading connected devices...');
  };

  const scanForDevices = () => {
    setIsScanning(true);
    setAvailableDevices([]);

    // Simulate scanning with progressive device discovery
    setTimeout(() => {
      setAvailableDevices([mockWearables[0]]);
    }, 500);

    setTimeout(() => {
      setAvailableDevices([mockWearables[0], mockWearables[1]]);
    }, 1000);

    setTimeout(() => {
      setAvailableDevices([mockWearables[0], mockWearables[1], mockWearables[2]]);
    }, 1500);

    setTimeout(() => {
      setAvailableDevices(mockWearables);
      setIsScanning(false);
    }, 2500);
  };

  const connectDevice = (device) => {
    Alert.alert(
      'Connect Device',
      `Connect to ${device.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Connect',
          onPress: () => {
            // Simulate connection
            const updatedDevice = { ...device, connected: true };
            setConnectedDevices([...connectedDevices, updatedDevice]);
            setAvailableDevices(availableDevices.filter(d => d.id !== device.id));
            Alert.alert('Success', `Connected to ${device.name}`);
          },
        },
      ]
    );
  };

  const disconnectDevice = (device) => {
    Alert.alert(
      'Disconnect Device',
      `Disconnect from ${device.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setConnectedDevices(connectedDevices.filter(d => d.id !== device.id));
            Alert.alert('Disconnected', `${device.name} has been disconnected`);
          },
        },
      ]
    );
  };

  const syncData = (device) => {
    Alert.alert('Syncing', `Syncing data from ${device.name}...`);
    // In production, this would sync actual health data
    setTimeout(() => {
      Alert.alert('Success', 'Data synced successfully!');
    }, 1500);
  };

  const DeviceCard = ({ device, connected }) => (
    <View style={[styles.deviceCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.deviceIcon}>
        <Text style={styles.deviceIconText}>{device.icon}</Text>
      </View>
      
      <View style={styles.deviceInfo}>
        <Text style={[styles.deviceName, { color: colors.text }]}>{device.name}</Text>
        <Text style={[styles.deviceType, { color: colors.textSecondary }]}>{device.type}</Text>
        {connected && (
          <View style={styles.batteryInfo}>
            <Text style={[styles.batteryText, { color: colors.textSecondary }]}>
              🔋 {device.battery}%
            </Text>
          </View>
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
          </Text>
        </View>

        {/* Connected Devices */}
        {connectedDevices.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Connected Devices</Text>
            {connectedDevices.map(device => (
              <DeviceCard key={device.id} device={device} connected={true} />
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
                description="Automatically sync data when connected"
                value={syncEnabled}
                onValueChange={setSyncEnabled}
              />
              <SyncSetting
                label="Sync Steps"
                description="Sync step count from wearable"
                value={true}
                onValueChange={() => {}}
              />
              <SyncSetting
                label="Sync Heart Rate"
                description="Sync heart rate measurements"
                value={true}
                onValueChange={() => {}}
              />
              <SyncSetting
                label="Sync Sleep Data"
                description="Sync sleep tracking information"
                value={true}
                onValueChange={() => {}}
              />
            </View>
          </View>
        )}

        {/* Scan for Devices */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Devices</Text>
          
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: colors.primary }]}
            onPress={scanForDevices}
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.scanButtonText}>Scanning...</Text>
              </>
            ) : (
              <>
                <Text style={styles.scanButtonIcon}>🔍</Text>
                <Text style={styles.scanButtonText}>Scan for Devices</Text>
              </>
            )}
          </TouchableOpacity>

          {availableDevices.length > 0 && (
            <View style={styles.devicesList}>
              {availableDevices
                .filter(device => !connectedDevices.find(d => d.id === device.id))
                .map(device => (
                  <DeviceCard key={device.id} device={device} connected={false} />
                ))}
            </View>
          )}

          {!isScanning && availableDevices.length === 0 && (
            <View style={[styles.emptyState, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={styles.emptyStateIcon}>⌚</Text>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No devices found. Make sure your wearable is nearby and Bluetooth is enabled.
              </Text>
            </View>
          )}
        </View>

        {/* Supported Devices */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Supported Devices</Text>
          <View style={[styles.supportedCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.supportedText, { color: colors.textSecondary }]}>
              • Apple Watch (Series 4 and later){'\n'}
              • Samsung Galaxy Watch{'\n'}
              • Fitbit (Charge, Versa, Sense){'\n'}
              • Garmin (Forerunner, Fenix, Venu){'\n'}
              • Xiaomi Mi Band{'\n'}
              • Huawei Watch{'\n'}
              • Amazfit{'\n'}
              • Polar
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
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
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  deviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceIconText: {
    fontSize: 28,
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
    fontSize: 13,
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
    gap: 8,
  },
  syncButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  disconnectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disconnectButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  settingsCard: {
    borderRadius: 16,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
  },
  scanButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  scanButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  devicesList: {
    marginTop: 8,
  },
  emptyState: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  supportedCard: {
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  supportedText: {
    fontSize: 14,
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 32,
  },
});
