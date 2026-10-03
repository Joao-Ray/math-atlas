import { StyleSheet, TextInput, View } from 'react-native';

import { palette, radii, spacing } from '@/constants/Theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
};

export function SearchField({ value, onChangeText, placeholder }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={`⌕  ${placeholder}`}
        placeholderTextColor={palette.muted}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderWidth: 1,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  input: { color: palette.ink, fontSize: 15, paddingHorizontal: spacing.md, paddingVertical: 14 },
});
