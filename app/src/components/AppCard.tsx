import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

export const AppCard: React.FC<React.PropsWithChildren & { muted?: boolean }> = ({ children, muted = false }) => {
  const { theme } = useAppTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: muted ? theme.colors.surfaceMuted : theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.border,
        },
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
});
