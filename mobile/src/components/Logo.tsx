import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

interface LogoProps {
  size?: number;
  showTagline?: boolean;
}

export function Logo({ size = 40, showTagline = false }: LogoProps) {
  const iconSize = size;
  const fontSize = size * 0.45;

  return (
    <View style={styles.container}>
      <View style={[styles.icon, { width: iconSize, height: iconSize, borderRadius: iconSize * 0.2 }]}>
        <View style={[styles.gradCapBase, { width: iconSize * 0.65, height: iconSize * 0.35, borderRadius: iconSize * 0.03 }]}>
          <View style={[styles.gradCapTop, { width: iconSize * 0.85, height: iconSize * 0.2, borderRadius: iconSize * 0.02 }]} />
          <View style={[styles.gradCapButton, { width: iconSize * 0.15, height: iconSize * 0.15, borderRadius: iconSize * 0.04, top: iconSize * 0.05 }]} />
        </View>
        <View style={[styles.gradCapTassel, { width: iconSize * 0.65, height: iconSize * 0.08, borderRadius: iconSize * 0.02, top: iconSize * 0.6 }]} />
      </View>
      <Text style={[styles.title, { fontSize, color: colors.text, marginTop: size * 0.1 }]}>خريجون</Text>
      {showTagline && (
        <Text style={[styles.tagline, { fontSize: size * 0.2, color: colors.textMuted }]}>GRADUATORS</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradCapBase: {
    backgroundColor: '#FFFFFF',
    opacity: 0.95,
    position: 'absolute',
  },
  gradCapTop: {
    backgroundColor: '#FFFFFF',
    opacity: 0.95,
    position: 'absolute',
    top: -2,
  },
  gradCapButton: {
    backgroundColor: '#0A0E1A',
    opacity: 0.8,
    position: 'absolute',
  },
  gradCapTassel: {
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
    position: 'absolute',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  tagline: {
    letterSpacing: 4,
    fontWeight: '500',
  },
});
