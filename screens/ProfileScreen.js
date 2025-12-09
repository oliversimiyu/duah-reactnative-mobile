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

export default function ProfileScreen({ navigation, route }) {
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
    darkMode: false,
    waterReminder: true,
    activityTracking: true,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
    // Update the navigation params so HomeScreen can access the new name
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
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E0E0E0', true: '#A78BFA' }}
          thumbColor={value ? '#6200ee' : '#F4F4F4'}
          ios_backgroundColor="#E0E0E0"
        />
      ) : (
        <Text style={styles.settingValue}>{value}</Text>
      )}
    </View>
  );

  const InfoRow = ({ label, value, onChangeText, editable }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {editable && isEditing ? (
        <TextInput
          style={styles.infoInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={label}
        />
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          <Text style={styles.editText}>{isEditing ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            {isEditing && (
              <TouchableOpacity style={styles.changePhotoButton}>
                <Text style={styles.changePhotoText}>📷</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
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
          <Text style={styles.sectionTitle}>Health Metrics</Text>
          <View style={styles.card}>
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
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>BMI</Text>
              <Text style={[styles.infoValue, styles.bmiValue]}>
                {(profile.weight / ((profile.height / 100) ** 2)).toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notifications Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
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
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.card}>
            <SettingRow
              label="Activity Tracking"
              value={settings.activityTracking}
              onValueChange={(value) => setSettings({...settings, activityTracking: value})}
            />
            <SettingRow
              label="Dark Mode"
              value={settings.darkMode}
              onValueChange={(value) => setSettings({...settings, darkMode: value})}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>View Activity History</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🎯</Text>
            <Text style={styles.actionText}>Manage Goals</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🔒</Text>
            <Text style={styles.actionText}>Privacy & Security</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>❓</Text>
            <Text style={styles.actionText}>Help & Support</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Duah Tech v1.0.0</Text>

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
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#6200ee',
  },
  editText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6200ee',
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F8F9FA',
  },
  changePhotoText: {
    fontSize: 18,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: '#8E8E93',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: '#8E8E93',
    flex: 1,
    textAlign: 'right',
  },
  infoInput: {
    fontSize: 15,
    color: '#000000',
    flex: 1,
    textAlign: 'right',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  bmiValue: {
    color: '#6200ee',
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 15,
    color: '#8E8E93',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
    fontWeight: '500',
    flex: 1,
  },
  actionArrow: {
    fontSize: 24,
    color: '#8E8E93',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 32,
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
  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  versionText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 24,
  },
  bottomSpacing: {
    height: 32,
  },
});
