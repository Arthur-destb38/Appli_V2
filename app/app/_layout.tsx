import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { WorkoutsProvider } from '@/hooks/useWorkouts';
import { UserProfileProvider } from '@/hooks/useUserProfile';
import { AppThemeProvider } from '@/theme/ThemeProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppThemeProvider>
        <UserProfileProvider>
          <WorkoutsProvider>
            <Stack>
          <Stack.Screen
            name="index"
            options={{ title: 'Séances', headerShown: false }}
          />
          <Stack.Screen
            name="create"
            options={{ title: 'Nouvelle séance', headerBackTitle: 'Retour' }}
          />
          <Stack.Screen
            name="track/[id]"
            options={{ title: 'Suivi séance', headerBackTitle: 'Retour' }}
          />
          <Stack.Screen
            name="history/index"
            options={{ title: 'Historique', headerBackTitle: 'Retour', headerShown: false }}
          />
          <Stack.Screen
            name="history/[id]"
            options={{ title: 'Détail séance', headerBackTitle: 'Retour' }}
          />
          <Stack.Screen
            name="history/progression"
            options={{ title: 'Progression', headerBackTitle: 'Retour' }}
          />
          <Stack.Screen
            name="programs/create"
            options={{ title: 'Nouveau programme', headerBackTitle: 'Retour' }}
          />
          <Stack.Screen
            name="legal/terms"
            options={{ title: 'Conditions d’utilisation', headerBackTitle: 'Retour' }}
          />
          <Stack.Screen
            name="legal/privacy"
            options={{ title: 'Politique de confidentialité', headerBackTitle: 'Retour' }}
          />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', title: 'Modal' }}
          />
            </Stack>
          </WorkoutsProvider>
        </UserProfileProvider>
      </AppThemeProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
