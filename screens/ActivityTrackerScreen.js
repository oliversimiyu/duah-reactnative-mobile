import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useTheme } from '../ThemeContext';

const { width, height } = Dimensions.get('window');

export default function ActivityTrackerScreen({ navigation }) {
  const { isDarkMode, colors } = useTheme();
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [calories, setCalories] = useState(0);
  const [route, setRoute] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  
  const locationSubscription = useRef(null);
  const startTime = useRef(null);
  const pausedTime = useRef(0);
  const lastPauseTime = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    requestLocationPermission();
    return () => {
      stopTracking();
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for activity tracking');
        return;
      }
      
      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Error getting location permission:', error);
      Alert.alert('Error', 'Failed to get location permission');
    }
  };

  const startTracking = async () => {
    try {
      setIsTracking(true);
      setIsPaused(false);
      startTime.current = Date.now() - pausedTime.current;
      
      // Start location tracking
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 5,
        },
        (location) => {
          const newCoord = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          
          setCurrentLocation({
            ...newCoord,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          
          setRoute((prevRoute) => {
            const updatedRoute = [...prevRoute, newCoord];
            
            // Calculate distance if we have at least 2 points
            if (updatedRoute.length > 1) {
              const lastPoint = updatedRoute[updatedRoute.length - 2];
              const dist = calculateDistance(
                lastPoint.latitude,
                lastPoint.longitude,
                newCoord.latitude,
                newCoord.longitude
              );
              setDistance((prevDist) => prevDist + dist);
            }
            
            return updatedRoute;
          });
          
          // Calculate speed (km/h)
          if (location.coords.speed !== null && location.coords.speed >= 0) {
            setSpeed(location.coords.speed * 3.6); // Convert m/s to km/h
          }
        }
      );
      
      // Start timer
      intervalRef.current = setInterval(() => {
        if (!isPaused) {
          const elapsed = Date.now() - startTime.current;
          setDuration(Math.floor(elapsed / 1000));
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error starting tracking:', error);
      Alert.alert('Error', 'Failed to start tracking: ' + error.message);
    }
  };

  const pauseTracking = () => {
    setIsPaused(true);
    lastPauseTime.current = Date.now();
  };

  const resumeTracking = () => {
    if (lastPauseTime.current) {
      pausedTime.current += Date.now() - lastPauseTime.current;
    }
    setIsPaused(false);
    lastPauseTime.current = null;
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const finishActivity = () => {
    Alert.alert(
      'Finish Activity',
      `Distance: ${distance.toFixed(2)} km\nTime: ${formatDuration(duration)}\nCalories: ${Math.round(calories)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: () => {
            stopTracking();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const resetActivity = () => {
    Alert.alert(
      'Reset Activity',
      'Are you sure you want to reset this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            stopTracking();
            setIsTracking(false);
            setIsPaused(false);
            setDistance(0);
            setDuration(0);
            setSpeed(0);
            setCalories(0);
            setRoute([]);
            startTime.current = null;
            pausedTime.current = 0;
            lastPauseTime.current = null;
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
    return R * c;
  };

  const toRad = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Calculate calories (rough estimate: 50 calories per km for walking/running)
  useEffect(() => {
    setCalories(distance * 50);
  }, [distance]);

  // Calculate average pace (min/km)
  const pace = duration > 0 && distance > 0 ? (duration / 60) / distance : 0;

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Activity Tracker</Text>
        <TouchableOpacity 
          style={[styles.resetButton, { backgroundColor: colors.error }]}
          onPress={resetActivity}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Current Location */}
        {currentLocation && (
          <View style={[styles.locationCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.locationTitle, { color: colors.text }]}>📍 Current Location</Text>
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              Lat: {currentLocation.latitude.toFixed(6)}
            </Text>
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              Lng: {currentLocation.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {/* Activity Status */}
        <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.statusText, { color: colors.text }]}>
            {!isTracking ? '⏹️ Ready to Start' : isPaused ? '⏸️ Paused' : '🏃 Tracking Active'}
          </Text>
          {isTracking && (
            <Text style={[styles.statusSubtext, { color: colors.textSecondary }]}>
              {route.length} GPS points recorded
            </Text>
          )}
        </View>

      {/* Stats Panel */}
      <View style={[styles.statsPanel, { backgroundColor: colors.surface }]}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{distance.toFixed(2)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>km</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatDuration(duration)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{speed.toFixed(1)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>km/h</Text>
          </View>
        </View>

        <View style={[styles.statsRow, { marginTop: 16 }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{pace.toFixed(2)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>min/km</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{Math.round(calories)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>calories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{route.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>points</Text>
          </View>
        </View>
      </View>

      {/* Control Buttons */}
      <View style={[styles.controlPanel, { backgroundColor: colors.surface }]}>
        {!isTracking ? (
          <TouchableOpacity 
            style={[styles.startButton, { backgroundColor: colors.success }]}
            onPress={startTracking}
          >
            <Text style={styles.startButtonText}>Start Tracking</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.trackingControls}>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: isPaused ? colors.success : colors.warning }]}
              onPress={isPaused ? resumeTracking : pauseTracking}
            >
              <Text style={styles.controlButtonText}>
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: colors.primary, marginLeft: 12 }]}
              onPress={finishActivity}
            >
              <Text style={styles.controlButtonText}>✓ Finish</Text>
            </TouchableOpacity>
          </View>
        )}
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
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  locationCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    marginVertical: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
  },
  statusSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  statsPanel: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  controlPanel: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trackingControls: {
    flexDirection: 'row',
  },
  controlButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
