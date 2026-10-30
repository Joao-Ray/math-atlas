import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/AppScreen';
import { PageTitle, SectionTitle } from '@/components/Typography';
import { palette, radii, spacing } from '@/constants/Theme';

export default function PrivacyScreen() {
  return (
    <AppScreen>
      <PageTitle subtitle="更新日期：2026 年 10 月 26 日">Lemivanta 隐私政策</PageTitle>
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>摘要</Text>
        <Text style={styles.summaryText}>Lemivanta 默认不自动上传或出售学习数据。学习记录保存在用户设备上，可由你主动导出和迁移。</Text>
      </View>

      <SectionTitle>我们处理的数据</SectionTitle>
      <Text style={styles.body}>收藏的知识点、公式、已完成例题、每日极限练习的日期、输入答案和自评，以及自由练习、复习草稿会保存在设备或浏览器本地。学习日历和连续天数由每日自评记录计算。这些信息不会自动上传到服务器，不自动跨设备同步。</Text>

      <SectionTitle>手动备份与分享</SectionTitle>
      <Text style={styles.body}>你可主动生成包含学习记录和草稿的备份文本。网页版可下载 JSON 文件；原生版可调用系统分享，由你选择应用或服务保存。分享后的数据由所选应用或服务处理，请仅发送到可信位置。恢复时合并数据，冲突保留本机记录，不覆盖原答案。</Text>

      <SectionTitle>网络与第三方服务</SectionTitle>
      <Text style={styles.body}>课程、公式、例题及本地精选论文随应用提供。进入“在线更新”后，App 会向论文服务发送分类、已提交的检索词、排序和分页位置，服务再请求 arXiv；网络服务可能接收 IP 地址及常规连接信息。输入过程不会逐字上传，不发送你的学习答案、收藏或自评。应用不含广告、分析或跨应用跟踪 SDK。</Text>
      <Text style={styles.body}>本机最多缓存最近 4 种检索的首页结果及检索标识，供离线阅读。在线页可单独清除这些缓存；学习记录清除操作不等同于清除论文缓存。论文缓存不纳入学习记录备份。服务端保留有限的元数据内存缓存并限流，不在应用代码中主动记录搜索日志；实际托管平台的访问日志需按部署方政策管理。</Text>

      <SectionTitle>数据控制</SectionTitle>
      <Text style={styles.body}>用户可以在“设置与关于”中清除全部本地学习数据（包括自由练习与复习草稿），或在每日练习中重做单题并清空该题答案与自评。网页版清除该网站的浏览器数据后，记录也会丢失。你另外保存或分享的备份不会随 App 内清除操作删除，请自行管理。建议先备份再清除。</Text>

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
