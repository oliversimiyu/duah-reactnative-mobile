import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Accelerometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { useTheme } from '../ThemeContext';

export default function HomeScreen({ navigation, route }) {
  const { isDarkMode, colors } = useTheme();
  const [userName, setUserName] = useState(route.params?.userName || 'User');
  const [currentDate, setCurrentDate] = useState('');
  
  // Activity tracking states
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [distance, setDistance] = useState(0);
  const [heartRate, setHeartRate] = useState(72);
  const [isTracking, setIsTracking] = useState(false);
  const [sensorData, setSensorData] = useState({ x: 0, y: 0, z: 0, mag: 0 });
  
  // Step detection variables
  const lastMagnitude = useRef(1);
  const lastTimestamp = useRef(0);
  const stepThreshold = 0.2; // Adjusted threshold
  const dailyStepGoal = 10000;
  const accelerometerSubscription = useRef(null);
  const magnitudeHistory = useRef([]);
  const peakDetected = useRef(false);
  
  // Location tracking
  const [locationSubscription, setLocationSubscription] = useState(null);
  const lastPosition = useRef(null);

  useEffect(() => {
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('en-US', options));
    
    // Start tracking automatically
    startTracking();
    
    return () => {
      stopTracking();
    };
  }, []);

  useEffect(() => {
    if (route.params?.userName) {
      setUserName(route.params.userName);
    }
  }, [route.params?.userName]);
  
  // Calculate calories based on steps (approximately 0.04 calories per step)
  useEffect(() => {
    setCalories(Math.round(steps * 0.04));
  }, [steps]);

  const startTracking = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied - distance tracking disabled');
      }
      
      // Start accelerometer for step counting
      Accelerometer.setUpdateInterval(100); // Update every 100ms
      
      const subscription = Accelerometer.addListener(accelerometerData => {
        const { x, y, z } = accelerometerData;
        const currentTimestamp = Date.now();
        
        // Calculate magnitude of acceleration vector
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        
        // Update sensor data for debugging
        setSensorData({ x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2), mag: magnitude.toFixed(2) });
        
        // Add to history (keep last 10 readings for smoothing)
        magnitudeHistory.current.push(magnitude);
        if (magnitudeHistory.current.length > 10) {
          magnitudeHistory.current.shift();
        }
        
        // Need at least 5 readings for pattern detection
        if (magnitudeHistory.current.length < 5) {
          lastMagnitude.current = magnitude;
          return;
        }
        
        // Detect peak (magnitude higher than neighbors)
        const prevMag = magnitudeHistory.current[magnitudeHistory.current.length - 2];
        const isPeak = magnitude > lastMagnitude.current && magnitude > prevMag;
        
        // Detect valley (magnitude lower than neighbors)
        const isValley = magnitude < lastMagnitude.current && magnitude < prevMag;
        
        // A step is detected when we see a peak followed by a valley
        // This pattern is characteristic of walking, not random shaking
        if (isPeak && !peakDetected.current) {
          peakDetected.current = true;
        } else if (isValley && peakDetected.current) {
          // Calculate the magnitude difference
          const magnitudeChange = Math.abs(magnitude - lastMagnitude.current);
          
          // Check if this looks like a walking pattern
          if (magnitudeChange > stepThreshold) {
            // Prevent double counting (minimum 250ms between steps)
            // Normal walking pace is 1.5-2 steps per second
            if (currentTimestamp - lastTimestamp.current > 250) {
              // Additional validation: check if magnitude is within walking range
              // Typical walking magnitude is between 0.8 and 1.5
              if (magnitude > 0.5 && magnitude < 2.0) {
                setSteps(prevSteps => {
                  const newSteps = prevSteps + 1;
                  console.log('Step detected! Total steps:', newSteps);
                  return newSteps;
                });
                lastTimestamp.current = currentTimestamp;
                
                // Simulate heart rate variation during activity
                setHeartRate(prev => Math.min(120, Math.max(70, prev + (Math.random() * 4 - 2))));
              }
            }
          }
          peakDetected.current = false;
        }
        
        lastMagnitude.current = magnitude;
      });
      
      accelerometerSubscription.current = subscription;
      
      // Start location tracking for distance
      if (status === 'granted') {
        const locSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            if (lastPosition.current) {
              const dist = calculateDistance(
                lastPosition.current.coords.latitude,
                lastPosition.current.coords.longitude,
                location.coords.latitude,
                location.coords.longitude
              );
              setDistance(prevDistance => prevDistance + dist);
            }
            lastPosition.current = location;
          }
        );
        setLocationSubscription(locSubscription);
      }
      
      setIsTracking(true);
      console.log('Activity tracking started');
    } catch (error) {
      console.error('Error starting tracking:', error);
      Alert.alert('Error', 'Failed to start activity tracking: ' + error.message);
    }
  };

  const stopTracking = () => {
    console.log('Stopping activity tracking');
    if (accelerometerSubscription.current) {
      accelerometerSubscription.current.remove();
      accelerometerSubscription.current = null;
    }
    Accelerometer.removeAllListeners();
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsTracking(false);
  };

  const resetStats = () => {
    Alert.alert(
      'Reset Stats',
      'Are you sure you want to reset all activity stats?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSteps(0);
            setCalories(0);
            setDistance(0);
            setHeartRate(72);
            lastPosition.current = null;
            magnitudeHistory.current = [];
            peakDetected.current = false;
          },
        },
      ]
    );
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  const StatCard = ({ icon, value, label, unit, color }) => (
    <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statInfo}>
        <View style={styles.statValueRow}>
          <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
          <Text style={[styles.statUnit, { color: colors.textSecondary }]}>{unit}</Text>
        </View>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
    </View>
  );

  const MainStatCard = ({ icon, value, label, unit, progress, color }) => (
    <View style={[styles.mainStatCard, { backgroundColor: color }]}>
      <View style={styles.mainStatHeader}>
        <Text style={styles.mainStatIcon}>{icon}</Text>
        <View style={styles.mainStatInfo}>
          <View style={styles.mainStatValueRow}>
            <Text style={styles.mainStatValue}>{value}</Text>
            <Text style={styles.mainStatUnit}>{unit}</Text>
          </View>
          <Text style={styles.mainStatLabel}>{label}</Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{progress}% of daily goal</Text>
    </View>
  );

  const QuickActionButton = ({ icon, label, onPress }) => (
    <TouchableOpacity 
      style={[styles.quickAction, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
    >
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={[styles.quickActionLabel, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good day,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{currentDate}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.trackingButton, { backgroundColor: isTracking ? colors.success : colors.error }]}
          onPress={() => isTracking ? stopTracking() : startTracking()}
        >
          <Text style={styles.trackingButtonText}>
            {isTracking ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Profile', {
            userName: userName,
            updateUserName: setUserName
          })}
        >
          <Text style={styles.profileButtonText}>{userName.charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Main Activity Stats */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Activity</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity 
                onPress={() => setSteps(prev => prev + 10)}
                style={{ marginRight: 16 }}
              >
                <Text style={[styles.resetText, { color: colors.primary }]}>+10 Test</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={resetStats}>
                <Text style={[styles.resetText, { color: colors.error }]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
          <MainStatCard
            icon="🚶"
            value={steps.toLocaleString()}
            label="Steps"
            unit="steps"
            progress={Math.min(100, Math.round((steps / dailyStepGoal) * 100))}
            color={colors.primary}
          />
        </View>

        {/* Health Stats Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Health Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="❤️"
              value={Math.round(heartRate)}
              label="Heart Rate"
              unit="bpm"
              color="#FF6B6B"
            />
            <StatCard
              icon="🔥"
              value={calories}
              label="Calories"
              unit="kcal"
              color="#FF9F43"
            />
            <StatCard
              icon="📍"
              value={distance.toFixed(2)}
              label="Distance"
              unit="km"
              color="#5F27CD"
            />
            <StatCard
              icon="⏱️"
              value={Math.round(steps / 100)}
              label="Active Time"
              unit="min"
              color="#00D2D3"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton 
              icon="🏃" 
              label="Track Activity" 
              onPress={() => navigation.navigate('ActivityTracker')}
            />
            <QuickActionButton 
              icon="⌚" 
              label="Wearables" 
              onPress={() => navigation.navigate('Wearables')}
            />
            <QuickActionButton icon="💊" label="Medication" />
            <QuickActionButton icon="📊" label="Reports" />
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activities</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {steps > 0 && (
            <View style={[styles.activityCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityIconText}>🚶</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>Walking Activity</Text>
                <Text style={[styles.activityDetails, { color: colors.textSecondary }]}>
                  {steps.toLocaleString()} steps • {distance.toFixed(2)} km • {calories} kcal
                </Text>
              </View>
              <Text style={[styles.activityTime, { color: colors.textSecondary }]}>Active</Text>
            </View>
          )}

          <View style={[styles.activityCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>🏃</Text>
            </View>
            <View style={styles.activityInfo}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>Morning Run</Text>
              <Text style={[styles.activityDetails, { color: colors.textSecondary }]}>5.2 km • 32 min • 420 kcal</Text>
            </View>
            <Text style={[styles.activityTime, { color: colors.textSecondary }]}>2h ago</Text>
          </View>

          <View style={[styles.activityCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>🍎</Text>
            </View>
            <View style={styles.activityInfo}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>Healthy Breakfast</Text>
              <Text style={[styles.activityDetails, { color: colors.textSecondary }]}>Oatmeal & Fruits • 350 kcal</Text>
            </View>
            <Text style={[styles.activityTime, { color: colors.textSecondary }]}>4h ago</Text>
          </View>
        </View>

        {/* Activity Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Activity Status</Text>
          <View style={[styles.tipCard, { backgroundColor: isTracking ? colors.successLight : colors.errorLight }]}>
            <Text style={styles.tipIcon}>{isTracking ? '🏃' : '⏸️'}</Text>
            <Text style={[styles.tipText, { color: colors.text }]}>
              {isTracking 
                ? 'Activity tracking is active. Your steps, distance, and calories are being monitored in real-time.' 
                : 'Activity tracking is paused. Press the play button in the header to resume tracking.'}
            </Text>
          </View>
        </View>

        {/* Health Tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Health Tip of the Day</Text>
          <View style={[styles.tipCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={[styles.tipText, { color: colors.text }]}>
              Walk at least 10,000 steps daily! Regular walking improves cardiovascular health, strengthens bones, and boosts your mood.
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
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  date: {
    fontSize: 13,
    marginTop: 2,
  },
  trackingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackingButtonText: {
    fontSize: 20,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
  },
  mainStatCard: {
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  mainStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainStatIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  mainStatInfo: {
    flex: 1,
  },
  mainStatValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  mainStatValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mainStatUnit: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 4,
    opacity: 0.9,
  },
  mainStatLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.9,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 8,
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '48%',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: '1%',
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
  statIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statUnit: {
    fontSize: 12,
    marginLeft: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  quickAction: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: '1%',
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
  quickActionIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityCard: {
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
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 24,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDetails: {
    fontSize: 13,
  },
  activityTime: {
    fontSize: 12,
  },
  tipCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  tipIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
});
