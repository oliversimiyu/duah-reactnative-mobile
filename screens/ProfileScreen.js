import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../ThemeContext';

export default function ProfileScreen({ navigation, route }) {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [profile, setProfile] = useState({
    name: route.params?.userName || 'User',
    email: 'user@duahtech.com',
    phone: '+1 234 567 8900',
    age: '28',
    height: '175',
    weight: '70',
    gender: 'Male',
  });

  const [settings, setSettings] = useState({
    notifications: true,
    dailyReminders: true,
    weeklyReports: false,
    waterReminder: true,
    activityTracking: true,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
    if (route.params?.updateUserName) {
      route.params.updateUserName(profile.name);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const SettingRow = ({ label, value, onValueChange, type = 'switch' }) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
          thumbColor={value ? colors.primary : '#F4F4F4'}
          ios_backgroundColor="#E0E0E0"
        />
      ) : (
        <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text>
      )}
    </View>
  );

  const InfoRow = ({ label, value, onChangeText, editable }) => (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.text }]}>{label}</Text>
      {editable && isEditing ? (
        <TextInput
          style={[styles.infoInput, { backgroundColor: colors.surfaceVariant, color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={label}
          placeholderTextColor={colors.textSecondary}
        />
      ) : (
        <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{value}</Text>
      )}
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile & Settings</Text>
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          <Text style={styles.editText}>{isEditing ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            {isEditing && (
              <TouchableOpacity style={[styles.changePhotoButton, { backgroundColor: colors.surface, borderColor: colors.background }]}>
                <Text style={styles.changePhotoText}>📷</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>{profile.name}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{profile.email}</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <InfoRow 
              label="Full Name" 
              value={profile.name}
              onChangeText={(text) => setProfile({...profile, name: text})}
              editable={true}
            />
            <InfoRow 
              label="Email" 
              value={profile.email}
              onChangeText={(text) => setProfile({...profile, email: text})}
              editable={true}
            />
            <InfoRow 
              label="Phone" 
              value={profile.phone}
              onChangeText={(text) => setProfile({...profile, phone: text})}
              editable={true}
            />
            <InfoRow 
              label="Age" 
              value={profile.age}
              onChangeText={(text) => setProfile({...profile, age: text})}
              editable={true}
            />
          </View>
        </View>

        {/* Health Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Health Metrics</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <InfoRow 
              label="Height (cm)" 
              value={profile.height}
              onChangeText={(text) => setProfile({...profile, height: text})}
              editable={true}
            />
            <InfoRow 
              label="Weight (kg)" 
              value={profile.weight}
              onChangeText={(text) => setProfile({...profile, weight: text})}
              editable={true}
            />
            <InfoRow 
              label="Gender" 
              value={profile.gender}
              onChangeText={(text) => setProfile({...profile, gender: text})}
              editable={true}
            />
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>BMI</Text>
              <Text style={[styles.infoValue, styles.bmiValue, { color: colors.primary }]}>
                {(profile.weight / ((profile.height / 100) ** 2)).toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notifications Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <SettingRow
              label="Push Notifications"
              value={settings.notifications}
              onValueChange={(value) => setSettings({...settings, notifications: value})}
            />
            <SettingRow
              label="Daily Reminders"
              value={settings.dailyReminders}
              onValueChange={(value) => setSettings({...settings, dailyReminders: value})}
            />
            <SettingRow
              label="Weekly Reports"
              value={settings.weeklyReports}
              onValueChange={(value) => setSettings({...settings, weeklyReports: value})}
            />
            <SettingRow
              label="Water Reminders"
              value={settings.waterReminder}
              onValueChange={(value) => setSettings({...settings, waterReminder: value})}
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <SettingRow
              label="Activity Tracking"
              value={settings.activityTracking}
              onValueChange={(value) => setSettings({...settings, activityTracking: value})}
            />
            <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
                thumbColor={isDarkMode ? colors.primary : '#F4F4F4'}
                ios_backgroundColor="#E0E0E0"
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={[styles.actionText, { color: colors.text }]}>View Activity History</Text>
            <Text style={[styles.actionArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}>
            <Text style={styles.actionIcon}>🎯</Text>
            <Text style={[styles.actionText, { color: colors.text }]}>Manage Goals</Text>
            <Text style={[styles.actionArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}>
            <Text style={styles.actionIcon}>🔒</Text>
            <Text style={[styles.actionText, { color: colors.text }]}>Privacy & Security</Text>
            <Text style={[styles.actionArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.cardBackground }]}>
            <Text style={styles.actionIcon}>❓</Text>
            <Text style={[styles.actionText, { color: colors.text }]}>Help & Support</Text>
            <Text style={[styles.actionArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>Duah Tech v1.0.0</Text>
        
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
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  changePhotoText: {
    fontSize: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    flex: 1,
    textAlign: 'right',
  },
  infoInput: {
    fontSize: 15,
    flex: 1,
    textAlign: 'right',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  bmiValue: {
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
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
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  actionArrow: {
    fontSize: 24,
  },
  logoutButton: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 32,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  versionText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 24,
  },
  bottomSpacing: {
    height: 32,
  },
});
