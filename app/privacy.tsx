import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { PageTitle, SectionTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';

export default function PrivacyScreen() {
  return (
    <AppScreen>
      <PageTitle subtitle="生效日期：2026 年 9 月 20 日">MathAtlas 隐私政策</PageTitle>
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>摘要</Text>
        <Text style={styles.summaryText}>MathAtlas 当前版本不收集、传输或出售个人数据。学习记录仅保存在用户设备上。</Text>
      </View>

      <SectionTitle>我们处理的数据</SectionTitle>
      <Text style={styles.body}>收藏的知识点、收藏的公式和已完成例题会保存在设备本地，用于展示个人学习进度。这些信息不会上传到服务器。</Text>

      <SectionTitle>网络与第三方服务</SectionTitle>
      <Text style={styles.body}>当前版本的课程、公式、例题和论文演示内容随应用一同提供。应用不含广告、分析或跨应用跟踪 SDK。</Text>

      <SectionTitle>数据控制</SectionTitle>
      <Text style={styles.body}>用户可以在“设置与关于”中随时清除全部本地学习数据。卸载应用也会删除这些本地数据。</Text>

      <SectionTitle>儿童隐私</SectionTitle>
      <Text style={styles.body}>本应用面向大学数学学习者，不以 13 岁以下儿童为目标用户，也不会主动收集儿童个人信息。</Text>

      <SectionTitle>政策更新与联系</SectionTitle>
      <Text style={styles.body}>当功能或数据处理方式发生变化时，本政策会同步更新。正式发布前，开发者需在此处补充可公开访问的联系邮箱与隐私政策网址。</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  summary: { backgroundColor: palette.green, borderRadius: radii.lg, padding: spacing.lg },
  summaryTitle: { color: '#BBD2C5', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  summaryText: { color: palette.white, fontSize: 16, lineHeight: 25, fontWeight: '600', marginTop: spacing.sm },
  body: { color: palette.muted, fontSize: 14, lineHeight: 23 },
});
