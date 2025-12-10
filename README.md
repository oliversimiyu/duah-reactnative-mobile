# Duah Tech - Wellness Mobile App

A comprehensive React Native wellness application with health tracking, activity monitoring, and wearables integration built with Expo.

## Features

- 🔐 **Authentication** - Login and Signup screens with validation
- 🏠 **Samsung Health-Style Dashboard** - Professional wellness home screen
- 👟 **Real-Time Step Counter** - Accelerometer-based step tracking with advanced algorithm
- 📍 **GPS Activity Tracking** - Track distance, duration, speed, pace, and calories
- ⌚ **Real BLE Wearables Integration** - Connect smartwatches via Bluetooth Low Energy
- 👤 **Profile Management** - Editable user info, BMI calculator, settings
- 🌓 **Dark Mode Support** - Automatic and manual theme switching
- 📱 **Cross-platform** - iOS, Android, Web support

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- **For basic features**: Expo Go app (for testing on physical device)
- **For wearables/BLE**: Development build required (BLE not supported in Expo Go)

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the App

### Option 1: Expo Go (Basic Features Only)
**Note**: Step counter, GPS tracking, and profile work. Wearables BLE will NOT work.

```bash
npm start
```

1. Install Expo Go app from App Store or Google Play
2. Scan the QR code with your device
3. Test authentication, step counter, GPS tracking, profile, dark mode

### Option 2: Development Build (All Features Including BLE)
**Required for**: Real Bluetooth wearables connectivity

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Create development build
eas build --profile development --platform android
# or for iOS
eas build --profile development --platform ios

# Or use local builds (faster)
npx expo run:android
npx expo run:ios
```

### Run on specific platforms:
```bash
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run web      # Run on web browser
```

## Project Structure

```
reactnative-app/
├── screens/
│   ├── SplashScreen.js          # Animated splash screen
│   ├── LoginScreen.js           # Login authentication
│   ├── SignupScreen.js          # User registration
│   ├── HomeScreen.js            # Samsung Health-style dashboard
│   ├── ActivityTrackerScreen.js # GPS activity tracking
│   ├── ProfileScreen.js         # User profile & settings
│   └── WearablesScreen.js       # BLE wearables integration
├── assets/                      # Images and assets
├── App.js                       # Main app with navigation & theme
├── ThemeContext.js              # Dark/light mode theme provider
├── app.json                     # Expo configuration with BLE plugin
├── package.json                 # Dependencies
├── README.md                    # This file
├── STEP_COUNTER_GUIDE.md        # Step counter documentation
├── WEARABLES_BLE_GUIDE.md       # BLE implementation guide
└── babel.config.js              # Babel configuration
```

## Screens Overview

### 🎨 Splash Screen
- Animated Duah Tech branding
- Smooth transition to login

### 🔐 Authentication Screens
- **Login**: Email/password authentication
- **Signup**: User registration with validation
- Mock authentication (extracts username from email)

### 🏠 Home Screen (Dashboard)
- **Real-time step counter** using accelerometer
  - Peak-valley detection algorithm
  - Prevents false counts from shaking
  - Calorie calculation (0.04 cal/step)
- **GPS distance tracking** with Haversine formula
- **Heart rate simulation** (mock data)
- **Quick Actions**: Navigate to Activity Tracker, Wearables, etc.
- **Dark mode toggle**

### 📍 Activity Tracker Screen
- Real-time GPS tracking
- Distance, duration, speed, pace calculations
- Calorie estimation (50 cal/km)
- Route coordinate recording
- Start/Pause/Resume/Finish controls
- Current location display (lat/long)

### ⌚ Wearables Screen (Real BLE)
- **Bluetooth device scanning** for nearby wearables
- **Connect/disconnect** to smartwatches
- **Battery level reading** from BLE Battery Service
- **Heart rate reading** from BLE Heart Rate Service
- **Sync settings**: Steps, heart rate, sleep data
- **Supported devices**: Apple Watch, Samsung Galaxy Watch, Fitbit, Garmin, Xiaomi Mi Band, Huawei Watch, Polar, Suunto
- **Signal strength (RSSI)** display
- **Note**: Requires development build (not Expo Go)

### 👤 Profile Screen
- Editable user information (name, email, phone)
- Health metrics (age, height, weight, gender)
- Real-time BMI calculation
- Notification settings
- Dark mode toggle
- Quick Actions menu
- Logout with confirmation

## Technologies Used

### Core
- **React Native** 0.81.5
- **React** 19.1.0
- **Expo** SDK 54

### Navigation
- **React Navigation** 7.x (Native Stack)

### Sensors & Location
- **expo-sensors** - Accelerometer for step counting
- **expo-location** - GPS tracking for activities

### Bluetooth
- **react-native-ble-plx** - Real Bluetooth Low Energy connectivity
- **buffer** - Base64 decoding for BLE data

### UI & Theme
- **Custom ThemeContext** - Dark/light mode management
- **expo-status-bar** - Status bar styling

### Utilities
- Platform-specific adaptations (iOS/Android)
- Haversine formula for GPS distance calculation

## Key Features Explained

### Step Counter Algorithm
- Uses accelerometer magnitude calculation: `√(x² + y² + z²)`
- Peak-valley pattern detection prevents false counts from shaking
- History buffer smooths readings over 10 samples
- Magnitude range validation (0.5-2.0)
- Minimum 250ms between steps
- See `STEP_COUNTER_GUIDE.md` for details

### GPS Activity Tracking
- Real-time location monitoring with `Location.watchPositionAsync`
- Haversine formula for accurate distance calculation
- Speed tracking in km/h
- Pace calculation in min/km
- Route coordinate recording
- Works in Expo Go (no native modules required)

### Real BLE Wearables Integration
- Scans for nearby Bluetooth devices
- Filters for known wearable brands
- Reads standard BLE services:
  - Battery Service (0x180F)
  - Heart Rate Service (0x180D)
- Automatic disconnection monitoring
- Android & iOS permission handling
- See `WEARABLES_BLE_GUIDE.md` for complete documentation

### Dark Mode
- Automatic system theme detection
- Manual toggle in profile
- Consistent color scheme across all screens
- Success/error color variants

## Documentation

- **README.md** - This file (project overview)
- **STEP_COUNTER_GUIDE.md** - Detailed step counter implementation
- **WEARABLES_BLE_GUIDE.md** - Complete BLE integration guide

## Known Limitations

### Current Implementation
- **Mock Authentication**: No real backend (uses email username)
- **No Data Persistence**: Data lost on app restart (AsyncStorage needed)
- **No Input Validation**: Forms accept any input
- **Test Button Present**: "+10 Test" button in HomeScreen (should be removed)
- **Navigation Params Warning**: Non-serializable function passed to Profile
- **Unused Dependency**: react-native-maps installed but not used

### BLE/Wearables
- **Development Build Required**: BLE doesn't work in Expo Go
- **Manufacturer Protocols**: Full data sync requires brand-specific SDKs
- **Limited Service Support**: Only reads standard BLE services (Battery, Heart Rate)
- **No Background Sync**: Sync only works when app is open

## Future Enhancements

### High Priority
- [ ] Add AsyncStorage for data persistence
- [ ] Implement real authentication (Firebase/backend)
- [ ] Add input validation throughout
- [ ] Remove test button or wrap in `__DEV__`
- [ ] Remove unused react-native-maps dependency
- [ ] Fix navigation params warning

### Medium Priority
- [ ] Add manufacturer-specific SDK integration
- [ ] Implement background BLE sync
- [ ] Add data visualization (charts)
- [ ] Create testing coverage
- [ ] Performance optimization (React.memo)
- [ ] Add notification support

### Low Priority
- [ ] Social login options
- [ ] Password recovery
- [ ] Multi-user profiles
- [ ] Cloud backup/sync
- [ ] Export health data

## Troubleshooting

### BLE/Wearables Issues
See `WEARABLES_BLE_GUIDE.md` for comprehensive troubleshooting.

### Step Counter Not Working
- Check if permissions granted for sensors
- Ensure device has accelerometer
- Try walking normally (not shaking)

### GPS Not Working
- Enable location permissions
- Ensure GPS is on
- Test outdoors (poor signal indoors)

### Dark Mode Not Switching
- Check system theme settings
- Try manual toggle in Profile screen

## Development Workflow

### Feature Branch Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push to remote
git push -u origin feature/your-feature

# Test thoroughly
# Merge to main when ready
git checkout main
git merge feature/your-feature
git push origin main
```

### Current Branch
- **Main**: Production-ready code
- **feature/wearables-integration**: Real BLE implementation (ready to merge)

## License

ISC
