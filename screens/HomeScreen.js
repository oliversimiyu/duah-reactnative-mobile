import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../ThemeContext';

export default function HomeScreen({ navigation, route }) {
  const { isDarkMode, colors } = useTheme();
  const [userName, setUserName] = useState(route.params?.userName || 'User');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('en-US', options));
  }, []);

  useEffect(() => {
    if (route.params?.userName) {
      setUserName(route.params.userName);
    }
  }, [route.params?.userName]);

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
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good day,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{currentDate}</Text>
        </View>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Activity</Text>
          <MainStatCard
            icon="🚶"
            value="8,432"
            label="Steps"
            unit="steps"
            progress={67}
            color={colors.primary}
          />
        </View>

        {/* Health Stats Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Health Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="❤️"
              value="72"
              label="Heart Rate"
              unit="bpm"
              color="#FF6B6B"
            />
            <StatCard
              icon="🔥"
              value="524"
              label="Calories"
              unit="kcal"
              color="#FF9F43"
            />
            <StatCard
              icon="💤"
              value="7.5"
              label="Sleep"
              unit="hrs"
              color="#5F27CD"
            />
            <StatCard
              icon="💧"
              value="6"
              label="Water"
              unit="cups"
              color="#00D2D3"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton icon="🏃" label="Start Workout" />
            <QuickActionButton icon="🍎" label="Log Meal" />
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

          <View style={[styles.activityCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>💧</Text>
            </View>
            <View style={styles.activityInfo}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>Hydration Goal</Text>
              <Text style={[styles.activityDetails, { color: colors.textSecondary }]}>6 glasses completed</Text>
            </View>
            <Text style={[styles.activityTime, { color: colors.textSecondary }]}>Just now</Text>
          </View>
        </View>

        {/* Health Tips */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Health Tip of the Day</Text>
          <View style={[styles.tipCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={[styles.tipText, { color: colors.text }]}>
              Stay hydrated! Aim to drink at least 8 glasses of water throughout the day to maintain optimal health and energy levels.
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
