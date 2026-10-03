import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { palette, radii, spacing } from '@/constants/Theme';

// Render MathJax's SVG directly on the web so SVG data attributes retain
// their original names instead of passing through the native SVG adapter.
const { mathjax } = require('react-native-mathjax-html-to-svg/mathjax/mathjax');
const { TeX } = require('react-native-mathjax-html-to-svg/mathjax/input/tex');
const { SVG } = require('react-native-mathjax-html-to-svg/mathjax/output/svg');
const { liteAdaptor } = require('react-native-mathjax-html-to-svg/mathjax/adaptors/liteAdaptor');
const { RegisterHTMLHandler } = require('react-native-mathjax-html-to-svg/mathjax/handlers/html');
require('react-native-mathjax-html-to-svg/mathjax/input/tex/ams/AmsConfiguration');

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const mathDocument = mathjax.document('', {
  InputJax: new TeX({ packages: ['base', 'ams'] }),
  OutputJax: new SVG({ fontCache: 'none', mtextInheritFont: true }),
  renderActions: { assistiveMml: [] },
});

type Props = {
  latex: string;
  compact?: boolean;
  bare?: boolean;
};

export function MathFormula({ latex, compact = false, bare = false }: Props) {
  const svg = useMemo(() => adaptor.innerHTML(mathDocument.convert(latex, { display: false })), [latex]);

  return (
    <View style={[!bare && styles.container, compact && styles.compact]}>
      <div
        role="img"
        aria-label={latex}
        style={{
          color: palette.ink,
          fontSize: compact ? 16 : 18,
          lineHeight: 1.6,
          width: '100%',
          overflowX: 'auto',
          paddingBottom: 3,
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
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
});
