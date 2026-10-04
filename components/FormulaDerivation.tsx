import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MathFormula } from '@/components/MathFormula';
import { palette, spacing } from '@/constants/Theme';
import { Formula } from '@/types';

export function FormulaDerivation({ formula }: { formula: Formula }) {
  const [expanded, setExpanded] = useState(false);
  if (!formula.derivation?.length) return null;

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? '收起' : '查看'}${formula.titleZh}推导`}
        accessibilityState={{ expanded }}
        onPress={(event) => { event.stopPropagation(); setExpanded((value) => !value); }}
        style={styles.toggle}>
        <Text style={styles.toggleText}>{expanded ? '收起推导 ↑' : '查看分步推导 ↓'}</Text>
      </Pressable>
      {expanded ? formula.derivation.map((step, index) => (
        <View key={`${formula.id}-${index}`} style={styles.step}>
          <Text style={styles.title}>{index + 1}. {step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>
          {step.latex ? <MathFormula latex={step.latex} compact /> : null}
        </View>
      )) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.line, marginTop: spacing.sm },
  toggle: { paddingVertical: 12, alignSelf: 'flex-start' },
  toggleText: { color: palette.green, fontSize: 13, fontWeight: '800' },
  step: { marginBottom: spacing.sm },
  title: { color: palette.ink, fontSize: 14, fontWeight: '700', marginBottom: 5 },
  body: { color: palette.muted, fontSize: 13, lineHeight: 21 },
});
