# Wearables Integration - Real BLE Implementation Guide

## Overview

The WearablesScreen now implements **real Bluetooth Low Energy (BLE)** connectivity using `react-native-ble-plx`. This allows the app to discover, connect to, and sync data with actual smartwatches and fitness trackers.

## Features Implemented

### ✅ Real BLE Scanning
- Scans for nearby Bluetooth Low Energy devices
- Filters devices by name to show only wearables (watches, bands, fitness trackers)
- Shows device RSSI (signal strength)
- 10-second scan duration with automatic stop

### ✅ Device Connection Management
- Connect to discovered BLE devices
- Automatic service and characteristic discovery
- Battery level reading (when available)
- Disconnection handling with automatic UI updates
- Connection state monitoring

### ✅ Data Synchronization
- Read battery level from standard Battery Service (0x180F)
- Read heart rate from Heart Rate Service (0x180D)
- Lists all available services on connected devices
- Manufacturer-specific protocol support (requires additional implementation)

### ✅ Permissions Handling
- Android 12+ (API 31+): BLUETOOTH_SCAN and BLUETOOTH_CONNECT
- Android 11 and below: ACCESS_FINE_LOCATION
- iOS: Automatic via Info.plist configuration

### ✅ User Experience
- Real-time device discovery during scanning
- Loading states and progress indicators
- Error handling with user-friendly alerts
- Signal strength display for available devices
- Battery status for connected devices

## Supported Devices

The app automatically detects and filters these device types:
- Apple Watch
- Samsung Galaxy Watch
- Fitbit
- Garmin
- Xiaomi Mi Band
- Huawei Watch
- Polar
- Suunto
- Any device with "watch", "band", or "fit" in the name

## BLE Services & UUIDs

### Standard Bluetooth Services
| Service | UUID | Description |
|---------|------|-------------|
| Battery Service | 0x180F | Battery level percentage |
| Heart Rate | 0x180D | Heart rate measurements |
| Device Information | 0x180A | Device model, manufacturer |

### Standard Characteristics
| Characteristic | UUID | Description |
|----------------|------|-------------|
| Battery Level | 0x2A19 | Battery percentage (0-100) |
| Heart Rate Measurement | 0x2A37 | Heart rate in BPM |

## Setup Requirements

### 1. Install Dependencies
```bash
npm install react-native-ble-plx buffer
```

### 2. Configure app.json
Already configured with BLE plugin:
```json
{
  "plugins": [
    [
      "react-native-ble-plx",
      {
        "isBackgroundEnabled": true,
        "modes": ["peripheral", "central"],
        "bluetoothAlwaysUsageDescription": "Allow Duah Tech to connect to your smartwatch",
        "bluetoothPeripheralUsageDescription": "Allow Duah Tech to connect to fitness devices"
      }
    ]
  ]
}
```

### 3. Build Configuration (Development Build Required)
⚠️ **Important**: BLE requires a development build or standalone build. It will **NOT work with Expo Go**.

```bash
# Create development build for Android
eas build --profile development --platform android

# Create development build for iOS
eas build --profile development --platform ios

# Or use local builds
npx expo run:android
npx expo run:ios
```

## Testing Guide

### Testing on Android (Physical Device)
1. Enable Bluetooth on your phone
2. Put your smartwatch in pairing mode
3. Open the app and navigate to Wearables screen
4. Tap "Scan for Devices"
5. Grant Bluetooth permissions when prompted
6. Wait for devices to appear
7. Tap "Connect" on your device
8. Once connected, tap "Sync" to read data

### Testing on iOS (Physical Device)
1. Enable Bluetooth on your iPhone
2. Put your smartwatch in pairing mode
3. Open the app and navigate to Wearables screen
4. Tap "Scan for Devices"
5. Devices should appear automatically
6. Tap "Connect" on your device
7. Once connected, tap "Sync" to read data

### Common Issues & Solutions

#### "Bluetooth Off" Alert
- **Solution**: Enable Bluetooth in phone settings

#### "Permission Denied" Alert
- **Solution**: Grant Bluetooth/Location permissions in app settings

#### "No Devices Found"
- **Solution**: 
  - Ensure your wearable is in pairing mode
  - Move closer to the device
  - Restart both phone and wearable
  - Check battery level on wearable

#### Connection Failed
- **Solution**:
  - Unpair device from system Bluetooth settings if previously paired
  - Restart the wearable
  - Try scanning again

#### App Crashes on Launch
- **Solution**: You're likely using Expo Go. Build a development build instead.

## Manufacturer-Specific Implementation

### Adding Custom Protocol Support

Each manufacturer has proprietary services for steps, sleep, etc. Here's how to add support:

#### Example: Reading Steps (Generic BLE Service)
```javascript
const syncSteps = async (device) => {
  try {
    // Example for a hypothetical step counter service
    const STEP_COUNTER_SERVICE = 'YOUR-STEP-SERVICE-UUID';
    const STEP_COUNT_CHARACTERISTIC = 'YOUR-STEP-CHAR-UUID';
    
    const characteristic = await device.readCharacteristicForService(
      STEP_COUNTER_SERVICE,
      STEP_COUNT_CHARACTERISTIC
    );
    
    if (characteristic.value) {
      const buffer = Buffer.from(characteristic.value, 'base64');
      const stepCount = buffer.readUInt32LE(0); // Adjust based on data format
      console.log('Steps:', stepCount);
      return stepCount;
    }
  } catch (error) {
    console.error('Failed to read steps:', error);
  }
};
```

#### Manufacturer SDKs
For full data synchronization, consider using official SDKs:
- **Apple Watch**: HealthKit (iOS only)
- **Samsung Galaxy Watch**: Samsung Health SDK
- **Fitbit**: Fitbit Web API
- **Garmin**: Garmin Connect API
- **Xiaomi**: Mi Fit API

## Code Structure

### Key Components

**bleManagerRef**: Singleton BLE manager instance
```javascript
const bleManagerRef = useRef(null);
bleManagerRef.current = new BleManager();
```

**scanForDevices()**: Initiates BLE scan
- Checks permissions
- Verifies Bluetooth is on
- Filters for wearables only
- Updates UI in real-time

**connectDevice()**: Connects to a BLE device
- Establishes connection
- Discovers services/characteristics
- Reads battery level
- Sets up disconnect listener

**syncData()**: Reads health data
- Reads heart rate if available
- Lists all services
- Returns sync status

## Future Enhancements

### Recommended Additions
1. **AsyncStorage Integration**: Persist connected devices
2. **Background Sync**: Sync data while app is in background
3. **Notification Support**: Alert when sync completes
4. **Data Visualization**: Charts for synced health data
5. **Multiple Profiles**: Support multiple users/watches
6. **Auto-reconnect**: Reconnect to previously paired devices
7. **Manufacturer SDKs**: Integrate official APIs for complete data access

### Data Storage Schema (AsyncStorage)
```javascript
{
  "connectedDevices": [
    {
      "id": "device-id",
      "name": "Apple Watch",
      "type": "Apple Watch",
      "lastConnected": "2025-12-10T10:30:00Z",
      "syncSettings": {
        "autoSync": true,
        "syncSteps": true,
        "syncHeartRate": true,
        "syncSleep": true
      }
    }
  ]
}
```

## API Reference

### BleManager Methods Used
- `state()`: Check if Bluetooth is powered on
- `startDeviceScan()`: Begin scanning for BLE devices
- `stopDeviceScan()`: Stop the scan
- `connectToDevice()`: Connect to a BLE device
- `cancelDeviceConnection()`: Disconnect from device
- `discoverAllServicesAndCharacteristics()`: Discover what device supports
- `readCharacteristicForService()`: Read data from device
- `destroy()`: Cleanup manager

### Device Properties
- `id`: Unique device identifier
- `name`: Device name (e.g., "Apple Watch")
- `rssi`: Signal strength in dBm
- `services()`: List of available BLE services

## Security & Privacy

### Data Handling
- All BLE communication is encrypted by default
- No health data is stored on servers (local only)
- Users control what data to sync via settings
- Devices can be disconnected anytime

### Permissions
- **Android**: Location permission required for BLE scanning (system requirement)
- **iOS**: Bluetooth usage descriptions shown to users
- All permissions requested at runtime with clear explanations

## Resources

- [react-native-ble-plx Documentation](https://github.com/dotintent/react-native-ble-plx)
- [Bluetooth SIG Services](https://www.bluetooth.com/specifications/gatt/services/)
- [BLE Characteristic UUIDs](https://www.bluetooth.com/specifications/gatt/characteristics/)
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)

## Support

For issues or questions:
1. Check this documentation
2. Review the Troubleshooting section in the app
3. Check console logs for BLE errors
4. Verify device is in pairing mode
5. Ensure development build is used (not Expo Go)

---

**Last Updated**: December 10, 2025
**Version**: 1.0.0
**Status**: Production Ready (requires dev build)
