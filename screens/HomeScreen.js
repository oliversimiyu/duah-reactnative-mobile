import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;

export default function HomeScreen({ navigation, route }) {
  const [userName, setUserName] = useState(route.params?.userName || 'User');
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Update userName when route params change
  React.useEffect(() => {
    if (route.params?.userName) {
      setUserName(route.params.userName);
    }
  }, [route.params?.userName]);

  const handleProfilePress = () => {
    navigation.navigate('Profile', {
      userName: userName,
      updateUserName: (newName) => {
        setUserName(newName);
        navigation.setParams({ userName: newName });
      },
    });
  };
  
  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const mainStats = [
    { 
      label: 'Steps', 
      value: '8,432', 
      icon: '👣', 
      unit: 'steps',
      target: 10000, 
      progress: 0.84,
      color: '#FF6B6B'
    },
    { 
      label: 'Active time', 
      value: '42', 
      icon: '⏱️', 
      unit: 'min',
      target: 60, 
      progress: 0.70,
      color: '#4ECDC4'
    },
  ];

  const secondaryStats = [
    { label: 'Heart rate', value: '72', unit: 'bpm', icon: '❤️', color: '#FF6B6B' },
    { label: 'Water', value: '1.5', unit: 'L', icon: '💧', color: '#4A90E2' },
    { label: 'Sleep', value: '7.2', unit: 'hrs', icon: '😴', color: '#9B59B6' },
    { label: 'Calories', value: '1,850', unit: 'kcal', icon: '🔥', color: '#F39C12' },
  ];

  const healthCategories = [
    { id: 1, icon: '🏃', title: 'Activity', subtitle: 'Track workouts', color: '#FF6B6B', bgColor: '#FFE5E5' },
    { id: 2, icon: '🥗', title: 'Nutrition', subtitle: 'Log meals', color: '#4CAF50', bgColor: '#E8F5E9' },
    { id: 3, icon: '💪', title: 'Body', subtitle: 'Weight & BMI', color: '#FF9800', bgColor: '#FFF3E0' },
    { id: 4, icon: '🧘', title: 'Mindfulness', subtitle: 'Meditation', color: '#9C27B0', bgColor: '#F3E5F5' },
    { id: 5, icon: '📊', title: 'Reports', subtitle: 'Analytics', color: '#2196F3', bgColor: '#E3F2FD' },
    { id: 6, icon: '🎯', title: 'Goals', subtitle: 'Set targets', color: '#00BCD4', bgColor: '#E0F7FA' },
  ];

  const renderProgressBar = (progress, color) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Compact Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.dateText}>{today}</Text>
          <Text style={styles.greeting}>Hello, {userName}</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={handleProfilePress}>
          <Text style={styles.menuIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Activity Cards */}
        <View style={styles.mainStatsContainer}>
          {mainStats.map((stat, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.mainStatCard}
              activeOpacity={0.7}
            >
              <View style={styles.mainStatHeader}>
                <Text style={styles.mainStatIcon}>{stat.icon}</Text>
                <View style={styles.mainStatInfo}>
                  <Text style={styles.mainStatLabel}>{stat.label}</Text>
                  <View style={styles.mainStatValueContainer}>
                    <Text style={[styles.mainStatValue, { color: stat.color }]}>
                      {stat.value}
                    </Text>
                    <Text style={styles.mainStatUnit}> {stat.unit}</Text>
                  </View>
                </View>
              </View>
              {renderProgressBar(stat.progress, stat.color)}
              <Text style={styles.progressText}>
                {Math.round(stat.progress * 100)}% of daily goal
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.quickStatsGrid}>
          {secondaryStats.map((stat, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.quickStatCard}
              activeOpacity={0.7}
            >
              <Text style={styles.quickStatIcon}>{stat.icon}</Text>
              <Text style={[styles.quickStatValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={styles.quickStatUnit}>{stat.unit}</Text>
              <Text style={styles.quickStatLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Health Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoriesGrid}>
            {healthCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: category.bgColor }]}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Insight Card */}
        <TouchableOpacity style={styles.insightCard} activeOpacity={0.7}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightBadge}>💡 Daily Insight</Text>
          </View>
          <Text style={styles.insightTitle}>Great progress today!</Text>
          <Text style={styles.insightText}>
            You're 84% towards your step goal. Take a 15-minute walk to reach your target.
          </Text>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    paddingHorizontal: CARD_MARGIN,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerContent: {
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingTop: 16,
  },
  mainStatsContainer: {
    paddingHorizontal: CARD_MARGIN,
    gap: 12,
  },
  mainStatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
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
  mainStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainStatIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  mainStatInfo: {
    flex: 1,
  },
  mainStatLabel: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 4,
  },
  mainStatValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  mainStatValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  mainStatUnit: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: CARD_MARGIN - 6,
    marginTop: 4,
    marginBottom: 8,
  },
  quickStatCard: {
    width: (width - (CARD_MARGIN * 2) - 12) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 6,
    alignItems: 'flex-start',
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
  quickStatIcon: {
    fontSize: 28,
    marginBottom: 12,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  quickStatUnit: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
  },
  quickStatLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: CARD_MARGIN,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  seeAllText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  categoryCard: {
    width: (width - (CARD_MARGIN * 2) - 24) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 6,
    alignItems: 'center',
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
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: CARD_MARGIN,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
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
  insightHeader: {
    marginBottom: 8,
  },
  insightBadge: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  insightTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 15,
    color: '#3C3C43',
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 32,
  },
});
