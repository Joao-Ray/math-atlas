import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, spacing } from '@/constants/Theme';
import { useStudy } from '@/contexts/StudyContext';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
};

export function AppScreen({ children, scroll = true, contentStyle }: Props) {
  const { storageError } = useStudy();
  const notice = storageError ? <Text accessibilityRole="alert" style={styles.notice}>{storageError}</Text> : null;
  if (!scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.content, styles.flex, contentStyle]}>{notice}{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}>
        {notice}{children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingBottom: 112, width: '100%', maxWidth: 1100, alignSelf: 'center' },
  notice: { color: palette.red, backgroundColor: '#F8E5E0', padding: spacing.md, marginTop: spacing.md, fontSize: 13, lineHeight: 22, borderRadius: 12 },
});
