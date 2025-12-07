import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Séances</Text>
        <Text style={styles.body}>Lance la prochaine séance ou parcours l’historique.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Réseau</Text>
        <Text style={styles.body}>Explore les séances partagées et duplique celles qui t’inspirent.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Programmes</Text>
        <Text style={styles.body}>Génère un programme personnalisé et suis-le en mode guidé.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#1f1f22',
    borderRadius: 14,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f2f2f2',
  },
  body: {
    marginTop: 6,
    fontSize: 14,
    color: '#9aa0aa',
  },
});
