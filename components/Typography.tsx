import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing } from '@/constants/Theme';

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function PageTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <View style={styles.pageTitleWrap}>
      <Text style={styles.pageTitle}>{children}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: palette.green,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  pageTitleWrap: { paddingTop: spacing.lg, marginBottom: spacing.lg },
  pageTitle: { color: palette.ink, fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  subtitle: { color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: spacing.xs },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { color: palette.ink, fontSize: 19, fontWeight: '800' },
});
