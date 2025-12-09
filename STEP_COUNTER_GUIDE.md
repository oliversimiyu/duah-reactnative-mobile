# Step Counter Feature Guide

## Overview
The Duah Tech wellness app now includes a working step counter that uses your device's accelerometer to track your activity in real-time.

## 🔧 Quick Troubleshooting

### If Steps Aren't Counting:

1. **Check Sensor Debug Panel** (scroll down on home screen)
   - Should show X, Y, Z values changing when you move the phone
   - Magnitude should change when you walk
   - If all values are 0 or not changing, accelerometer may not be available

2. **Use the "+10 Test" Button**
   - Located next to "Reset" button
   - Click to manually add 10 steps
   - Verifies the UI and counter are working

3. **Verify Tracking Status**
   - Green play/pause button = tracking active ✅
   - Red play/pause button = tracking paused ⏸️
   - Check sensor debug shows "Tracking Active"

4. **Movement Tips**
   - Hold phone naturally (in hand or pocket)
   - Walk with normal pace
   - Shake the phone up and down to test
   - Try walking 10-20 steps and check if count increases

## Features Implemented

### 1. **Real-Time Step Tracking**
- Uses device accelerometer to detect steps
- Updates step count automatically as you walk
- Threshold-based detection prevents false counts

### 2. **Activity Metrics**
- **Steps**: Real-time step counter with daily goal (10,000 steps)
- **Calories**: Automatically calculated (~0.04 cal per step)
- **Distance**: GPS-based distance tracking in kilometers
- **Heart Rate**: Simulated variation during activity
- **Active Time**: Estimated based on step count

### 3. **Controls**
- **Play/Pause Button** (▶️/⏸️): Toggle activity tracking on/off
- **Reset Button**: Clear all daily statistics
- **Auto-start**: Tracking begins automatically when app opens

### 4. **Visual Feedback**
- Progress bar showing % of daily step goal
- Color-coded status indicator (green = active, red = paused)
- Live activity card in "Recent Activities" section
- Real-time updates to all metrics

## How to Use

### Testing the Step Counter

1. **Start the App**
   ```bash
   npm start
   ```

2. **Open on Physical Device** (Required for accurate testing)
   - Scan QR code with Expo Go app
   - Step counter requires real device accelerometer
   - Emulators won't provide accurate step detection

3. **Grant Permissions**
   - Allow location access when prompted (for distance tracking)
   - Location permission is optional but recommended

4. **Test Walking**
   - Hold your phone and walk normally
   - Watch the step counter increment
   - Observe calories and other metrics update automatically

5. **Test Controls**
   - Tap ⏸️ icon to pause tracking
   - Tap ▶️ icon to resume
   - Tap "Reset" to clear all stats

### Expected Behavior

- **Step Detection**: Detects steps using Y-axis accelerometer changes
- **Minimum Interval**: 200ms between steps (prevents double counting)
- **Threshold**: 1.2G acceleration change triggers step detection
- **Goal**: 10,000 steps = 100% progress
- **Calories**: ~0.04 calories burned per step
- **Active Time**: Approximately steps ÷ 100 minutes

## Technical Details

### Sensors Used
- **Accelerometer**: expo-sensors package for step detection
- **GPS**: expo-location package for distance tracking
- **Update Rate**: 100ms for accelerometer data

### Permissions Required
- **Location (Foreground)**: For distance tracking
  - Optional - app works without it
  - Only distance metric affected if denied

### Data Storage
- Currently stores data in app state (resets on app restart)
- For persistent storage, AsyncStorage can be added later

## Troubleshooting

### Steps not counting?
- Ensure you're using a physical device (not emulator)
- Walk with normal movement patterns
- Hold phone naturally (not completely still)
- Check that tracking is active (green play/pause button)

### Distance not tracking?
- Grant location permissions
- Ensure GPS is enabled on device
- Distance tracking requires movement of at least 10 meters

### High battery usage?
- Pause tracking when not needed
- Location tracking uses more battery than accelerometer
- Consider stopping location if only step count is needed

## Future Enhancements

Potential features to add:
- [ ] Persistent storage with AsyncStorage
- [ ] Weekly/monthly statistics
- [ ] Step goal customization
- [ ] Activity history charts
- [ ] Export data functionality
- [ ] Background tracking (requires different permissions)
- [ ] Integration with health apps
- [ ] Achievement badges and milestones

## Notes

- Step detection algorithm is calibrated for normal walking
- Running or unusual movements may affect accuracy
- Device placement affects detection quality
- Best results when phone is in pocket or held naturally
