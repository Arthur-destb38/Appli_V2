import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

export default function PrivacyScreen() {
  const { theme } = useAppTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Politique de confidentialité</Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
        Nous stockons vos données d’entraînement localement. Aucune donnée n’est partagée sans votre action explicite.
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textPrimary }]}>Partage public</Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
        Le partage dans le feed n’est activé que si vous consentez au partage public. Vous pouvez retirer ce consentement
        dans les paramètres.
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textPrimary }]}>Données collectées</Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
        - Séances et séries enregistrées localement.{'\n'}
        - Données de profil (pseudo, consentement) pour le partage.{'\n'}
        - Aucune donnée publicitaire, aucun tracking tiers.
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textPrimary }]}>Suppression</Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
        Vous pouvez supprimer vos données locales en réinstallant l’application. Pour les données partagées, contactez le support.
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textPrimary }]}>Contact</Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
        Pour toute question : support@gorillax.dev
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
  },
});
