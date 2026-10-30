import { Text } from '@tarojs/components';
import { Card, Heading, Screen, Section } from '../components/UI';

export default function Privacy() {
  return <Screen><Heading title='隐私与内容说明' subtitle='Lemivanta 微信小程序本地预览版 · 2026-10-16' />
    <Section title='学习记录保存在当前小程序中'><Card><Text className='body'>本版不要求登录，不申请手机号、位置、通讯录或相册权限，不接入广告、分析或跟踪 SDK。收藏、完成状态、每日练习草稿和自评通过微信本地存储保存。本小程序的业务代码不把这些记录上传至服务器；卸载、清理微信数据或换设备可能使记录丢失，请手动备份。</Text></Card></Section>
    <Section title='备份、复制与平台行为'><Card><Text className='body'>仅当你点击复制备份或论文链接时，将相应内容写入剪贴板；本版不主动读取剪贴板。恢复时只处理你粘贴的备份文本。平台自身的登录、开发工具及小程序下载行为由微信提供，不等于本应用建立了账号或联网论文服务。</Text></Card></Section>
    <Section title='公式与论文'><Card><Text className='body'>公式在构建时由 LaTeX 生成图片，与应用一起打包，不依赖外部公式服务；图片异常时显示原始 LaTeX 并允许重试。论文仅为随包精选及阅读建议，不自动更新、不下载或转存全文。</Text></Card></Section>
    <Section title='手机验收反馈'><Card><Text className='body'>仅点击读取设备信息后，在本页显示机型、系统、微信和基础库版本、窗口尺寸；不读取设备唯一标识、账号或学习草稿。验收勾选与问题说明仅当前页面有效，点击复制反馈才写入剪贴板，不自动发送给开发者。是否分享由你决定。</Text></Card></Section>
    <Section title='题目来源与使用范围'><Card><Text className='body'>自编竞赛训练与按用户笔记整理的资料真题在详情中明确区分，不编造年份或官方认证。资料真题未与官方原卷二次核验，解析为重新编写，不承诺无误。专题练习不标为吉米多维奇原书原题。公开分发前仍需核对题源与使用授权；隐藏页码不等于取得授权。</Text></Card></Section>
    <Section title='尚未完成的发布准备'><Card><Text className='body'>本版不是已经上线的小程序，也不代表名称、商标、服务类目、隐私或备案要求已通过审核。正式发布前需由运营者补齐主体与联系方式、公开隐私政策、实际数据处理说明，并在手机上验收功能。本轮没有代为上传或提审。</Text></Card></Section>
  </Screen>;
}
