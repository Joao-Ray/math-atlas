import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { PageTitle, SectionTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';
import { PROJECT_REPOSITORY_URL, PROJECT_ISSUES_URL } from '@/data/projectLinks';

export default function OpenSourceScreen() {
  return <AppScreen>
    <PageTitle subtitle="一起检查数学内容，让学习工具持续变好。">源码与参与贡献</PageTitle>
    <View style={styles.card}>
      <Text style={styles.title}>Lemivanta · MathAtlas</Text>
      <Text style={styles.text}>查看源码、在自己的电脑运行项目，或通过 GitHub 参与改进。</Text>
      <Link href={PROJECT_REPOSITORY_URL} target="_blank" rel="noopener noreferrer" accessibilityRole="link" style={styles.link}>查看 GitHub 源码 ↗</Link>
      <Text style={styles.note}>外部链接将在浏览器中打开；提交反馈需要 GitHub 账号。</Text>
    </View>
    <SectionTitle>发现一道题有问题？</SectionTitle>
    <View style={styles.card}>
      <Text style={styles.text}>题目详情底部有“反馈这道题”入口。它会预填公开题目编号和链接；请在 GitHub 核对后自行提交。我们不会自动发送你的答案、草稿或学习记录。</Text>
      <Link href={PROJECT_ISSUES_URL} target="_blank" rel="noopener noreferrer" accessibilityRole="link" style={styles.link}>查看反馈与改进建议 ↗</Link>
    </View>
    <SectionTitle>可以怎样参与</SectionTitle>
    <View style={styles.card}>
      <Text style={styles.text}>补充题目适用条件、检查分步推导、改善公式可读性，或修复手机使用问题。修改前请阅读仓库的 CONTRIBUTING.md，并运行自动检查。</Text>
      <Text style={styles.note}>代码采用 MIT 许可，保留原有署名。第三方题目、论文元数据、字体等适用各自的权利说明；开源不代表取得教材或论文全文的再分发授权。</Text>
    </View>
  </AppScreen>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: palette.surface, borderWidth:1, borderColor:palette.line, borderRadius:radii.lg, padding:spacing.lg },
  title: { fontSize:20, fontWeight:'800', color:palette.ink },
  text: { color:palette.ink, fontSize:15, lineHeight:25, marginTop:spacing.sm },
  link: { color:palette.green, fontSize:15, fontWeight:'800', paddingVertical:14, marginTop:spacing.sm },
  note: { color:palette.muted, fontSize:12, lineHeight:21, marginTop:spacing.sm },
});
