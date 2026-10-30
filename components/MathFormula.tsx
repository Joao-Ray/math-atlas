import { ScrollView, StyleSheet, View } from 'react-native';
import { MathJaxSvg } from 'react-native-mathjax-html-to-svg';

import { palette, radii, spacing } from '@/constants/Theme';

type Props = {
  latex: string;
  compact?: boolean;
  bare?: boolean;
};

export function MathFormula({ latex, compact = false, bare = false }: Props) {
  return (
    <View style={[!bare && styles.container, compact && styles.compact]}>
      <ScrollView horizontal accessibilityLabel="数学公式，可左右滚动" contentContainerStyle={styles.scrollContent}>
        <MathJaxSvg
          color={palette.ink}
          fontSize={compact ? 1.8 : 2.2}
          style={styles.formula}
          fontCache={false}>
          {`\\(${latex}\\)`}
        </MathJaxSvg>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0EEE6',
    borderColor: palette.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 18,
    marginVertical: spacing.sm,
  },
  compact: { paddingVertical: 12 },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  formula: { minHeight: 28, justifyContent: 'center' },
});
