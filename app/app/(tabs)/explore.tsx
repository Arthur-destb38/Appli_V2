import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;
  const textColor = colorScheme === 'dark' ? '#f2f2f2' : '#111';
  const muted = colorScheme === 'dark' ? '#9aa0aa' : '#4a4f57';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>Découvrir</Text>
          <Text style={[styles.subtitle, { color: muted }]}>
            Idées d’entraînement, astuces et tests rapides.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Commencer</Text>
        <Text style={[styles.cardText, { color: muted }]}>
          Lance une séance, consulte l’historique ou explore les programmes partagés.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: textColor }]}>Programmes</Text>
        <Text style={[styles.cardText, { color: muted }]}>
          Génère un programme personnalisé dans l’onglet “Programmes”, puis suis-le avec le mode
          sport pour être guidé série par série.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#1f1f22',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
