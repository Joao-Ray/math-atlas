import { router } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { PageTitle, SectionTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { useStudy } from '@/contexts/StudyContext';

export default function SettingsScreen() {
  const { resetProgress } = useStudy();

  const confirmReset = () => {
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('确定清除全部收藏和完成记录吗？')) resetProgress();
      return;
    }
    Alert.alert('清除本地学习数据', '这会删除全部收藏和完成记录，且无法撤销。', [
      { text: '取消', style: 'cancel' },
      { text: '清除', style: 'destructive', onPress: resetProgress },
    ]);
  };

  return (
    <AppScreen>
      <PageTitle subtitle="管理本地数据并了解应用信息。">设置与关于</PageTitle>

      <SectionTitle>隐私</SectionTitle>
      <Pressable onPress={() => router.push('/privacy')} style={styles.row}>
        <View style={styles.rowContent}>
          <Text style={styles.rowTitle}>隐私政策</Text>
          <Text style={styles.rowDescription}>了解 MathAtlas 如何处理数据</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>本地优先</Text>
        <Text style={styles.infoText}>当前版本不要求登录、不含广告、不使用跟踪 SDK。收藏和完成记录只存储在设备上。</Text>
      </View>

      <SectionTitle>数据管理</SectionTitle>
      <Pressable onPress={confirmReset} style={styles.dangerRow}>
        <Text style={styles.dangerText}>清除全部本地学习数据</Text>
      </Pressable>

      <SectionTitle>关于</SectionTitle>
      <View style={styles.aboutCard}>
        <View style={styles.mark}><Text style={styles.markText}>∫</Text></View>
        <Text style={styles.appName}>MathAtlas</Text>
        <Text style={styles.version}>版本 1.0.0 · Build 1</Text>
        <Text style={styles.about}>知识点、公式、经典例题与数学研究的一体化学习地图。</Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.md, padding: spacing.md },
  rowContent: { flex: 1 },
  rowTitle: { color: palette.ink, fontSize: 16, fontWeight: '800' },
  rowDescription: { color: palette.muted, fontSize: 12, marginTop: 3 },
  chevron: { color: palette.muted, fontSize: 26 },
  infoCard: { backgroundColor: palette.greenSoft, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.sm },
  infoTitle: { color: palette.green, fontSize: 13, fontWeight: '800' },
  infoText: { color: palette.green, fontSize: 12, lineHeight: 19, marginTop: 4 },
  dangerRow: { backgroundColor: '#F8E5E0', borderRadius: radii.md, padding: spacing.md, alignItems: 'center' },
  dangerText: { color: palette.red, fontSize: 14, fontWeight: '800' },
  aboutCard: { alignItems: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.lg, padding: spacing.xl },
  mark: { width: 64, height: 64, borderRadius: 20, backgroundColor: palette.green, alignItems: 'center', justifyContent: 'center' },
  markText: { color: palette.gold, fontSize: 38, fontWeight: '900' },
  appName: { color: palette.ink, fontSize: 22, fontWeight: '900', marginTop: spacing.md },
  version: { color: palette.muted, fontSize: 11, marginTop: 3 },
  about: { color: palette.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: spacing.md },
});
