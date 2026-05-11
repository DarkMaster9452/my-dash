import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: string;
  gradient?: boolean;
  padding?: number;
}

export default function GlassCard({
  children,
  style,
  accent,
  gradient = false,
  padding = spacing.md,
}: GlassCardProps) {
  return (
    <View style={[styles.wrapper, style]}>
      {/* Accent glow */}
      {accent && (
        <View
          style={[
            styles.glow,
            { backgroundColor: accent, shadowColor: accent },
          ]}
        />
      )}

      <LinearGradient
        colors={gradient
          ? ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.04)']
          : ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.03)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { padding }]}
      >
        {/* Top border shimmer */}
        {accent && (
          <View style={[styles.topLine, { backgroundColor: accent }]} />
        )}
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: '10%',
    right: '10%',
    height: 40,
    borderRadius: 40,
    opacity: 0.15,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  card: {
    borderRadius: radius.lg,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.6,
  },
});
