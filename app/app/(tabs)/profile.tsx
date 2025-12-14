import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/ThemeProvider';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AppCard } from '@/components/AppCard';

export default function ProfileScreen() {
  const { theme } = useAppTheme();
  const { profile } = useUserProfile();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const menuItems = [
    { label: 'Mon profil public', route: '/profile/guest-user', icon: 'person-outline' as const },
    { label: 'Historique', route: '/history', icon: 'time-outline' as const },
    { label: 'Programmes', route: '/programs', icon: 'calendar-outline' as const },
    { label: 'Classement', route: '/leaderboard', icon: 'trophy-outline' as const },
    { label: 'Notifications', route: '/notifications', icon: 'notifications-outline' as const },
  ];

  const settingsItems = [
    { label: 'Paramètres', route: '/settings', icon: 'settings-outline' as const },
    { label: 'Conditions d\'utilisation', route: '/legal/terms', icon: 'document-text-outline' as const },
    { label: 'Confidentialité', route: '/legal/privacy', icon: 'shield-outline' as const },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, paddingTop: insets.top + 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header profil */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.accent }]}>
            <Text style={styles.avatarText}>
              {(profile?.username || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.username, { color: theme.colors.textPrimary }]}>
            {profile?.username || 'Utilisateur'}
          </Text>
          <Text style={[styles.bio, { color: theme.colors.textSecondary }]}>
            {profile?.bio || 'Aucune bio définie'}
          </Text>
        </View>

        {/* Menu principal */}
        <AppCard style={styles.card}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.menuItem,
                index !== menuItems.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.border,
                },
              ]}
              onPress={() => router.push(item.route as never)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={22} color={theme.colors.accent} />
                <Text style={[styles.menuItemText, { color: theme.colors.textPrimary }]}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </AppCard>

        {/* Paramètres */}
        <AppCard style={styles.card}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.menuItem,
                index !== settingsItems.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.border,
                },
              ]}
              onPress={() => router.push(item.route as never)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={22} color={theme.colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: theme.colors.textPrimary }]}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </AppCard>

        {/* Version */}
        <Text style={[styles.version, { color: theme.colors.textSecondary }]}>
          Gorillax v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 16,
  },
});

