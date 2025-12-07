import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

const TermsScreen: React.FC = () => {
  const { theme } = useAppTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Conditions générales d&apos;utilisation</Text>

      <Section title="1. Objet">
        Gorillax permet de planifier, suivre et partager des séances d&apos;entraînement. En utilisant l&apos;application, tu
        acceptes ces conditions et t&apos;engages à une utilisation personnelle et non commerciale.
      </Section>

      <Section title="2. Comptes et données">
        Tu es responsable des informations saisies dans l&apos;application. Nous ne vendons pas tes données. Les séances sont
        stockées localement et synchronisées uniquement lorsque tu actives la sync.
      </Section>

      <Section title="3. Contenus partagés">
        Les séances que tu rends publiques via le feed doivent rester respectueuses. Nous pouvons retirer tout contenu jugé
        inapproprié ou contraire à la loi.
      </Section>

      <Section title="4. Limitations">
        Gorillax ne remplace pas l&apos;avis d&apos;un professionnel de santé. Utilise l&apos;application à tes propres risques. Nous
        ne sommes pas responsables des dommages résultant d&apos;une mauvaise utilisation.
      </Section>

      <Section title="5. Support">
        Pour toute question, écris-nous via l&apos;adresse support figurant sur le dépôt GitHub du projet.
      </Section>
    </ScrollView>
  );
};

const Section: React.FC<{ title: string }> = ({ title, children }) => {
  const { theme } = useAppTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.paragraph, { color: theme.colors.textSecondary }]}>{children}</Text>
    </View>
  );
};

export default TermsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
  },
});
