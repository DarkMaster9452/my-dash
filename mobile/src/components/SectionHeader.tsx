import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface SectionHeaderProps {
  title: string;
  accent: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export default function SectionHeader({ title, accent, subtitle, right }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: accent }]}>{subtitle}</Text>}
        </View>
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    ...typography.label,
    color: colors.textSecondary,
  },
  subtitle: {
    ...typography.tiny,
    marginTop: 1,
  },
});
