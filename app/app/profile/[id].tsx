import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';
import { fetchUserStats } from '@/services/userProfileApi';

const mockCoachStats = {
  username: 'CoachBot',
  bio: 'Coach virtuel : recettes, programmes, tips.',
  stats: {
    sessions: 482,
    volume: '228 t',
    bestLift: 'Squat 190 kg · Bench 145 kg · Deadlift 240 kg',
    followers: 1240,
  },
};

export default function PublicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useAppTheme();
  const [stats, setStats] = useState<any | null>(null);

  const profile = useMemo(() => {
    const slug = (id || '').toLowerCase();
    if (slug.includes('coach') || slug.includes('virtual')) return mockCoachStats;
    return {
      username: id || 'Profil',
      bio: 'Profil public',
      stats: {
        sessions: 0,
        volume: '0 kg',
        bestLift: '-',
        followers: 0,
      },
    };
  }, [id]);

  useEffect(() => {
    const run = async () => {
      try {
        if (id) {
          const s = await fetchUserStats(id);
          if (s) {
            setStats(s);
          }
        }
      } catch {
        // ignore
      }
    };
    run();
  }, [id]);

  const mergedStats = stats
    ? {
        username: stats.username,
        bio: profile.bio,
        stats: {
          sessions: stats.sessions ?? profile.stats.sessions,
          volume: `${Math.round((stats.volume ?? 0) / 1000) / 1} kg`,
          bestLift: stats.best_lift ? `${Math.round(stats.best_lift)} kg` : profile.stats.bestLift,
          followers: profile.stats.followers,
        },
      }
    : profile;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={{ color: theme.colors.textPrimary }}>{'< Retour'}</Text>
      </TouchableOpacity>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.username, { color: theme.colors.textPrimary }]}>{mergedStats.username}</Text>
        <Text style={[styles.bio, { color: theme.colors.textSecondary }]}>{mergedStats.bio}</Text>
        <View style={styles.statsRow}>
          <Stat label="Séances" value={String(mergedStats.stats.sessions)} />
          <Stat label="Volume" value={mergedStats.stats.volume} />
          <Stat label="Best lift" value={mergedStats.stats.bestLift} />
          <Stat label="Followers" value={String(mergedStats.stats.followers)} />
        </View>
      </View>
    </View>
  );
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  back: { marginBottom: 12 },
  card: { borderRadius: 16, padding: 16, gap: 8 },
  username: { fontSize: 24, fontWeight: '700' },
  bio: { fontSize: 14 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  stat: { padding: 12, borderRadius: 12, backgroundColor: '#0f172a20', minWidth: 120 },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 12, color: '#6b7280' },
});
