import Taro from '@tarojs/taro';

export type Tab = 'home' | 'topics' | 'formulas' | 'problems' | 'study';
const pending: Partial<Record<Tab, Record<string, string>>> = {};
export function takeIntent(tab: Tab) { const value = pending[tab]; delete pending[tab]; return value; }
const warn = () => Taro.showToast({ title: '页面暂时无法打开，请重试', icon: 'none' });
export function openTab(tab: Tab, params: Record<string, string> = {}) {
  pending[tab] = params;
  void Taro.switchTab({ url: `/pages/${tab}/index` }).catch(() => { delete pending[tab]; return warn(); });
}
export function openPage(page: 'topic' | 'problem' | 'daily' | 'papers' | 'backup' | 'privacy' | 'review' | 'acceptance' | 'textbooks' | 'roadmap', id?: string) {
  void Taro.navigateTo({ url: `/pages/${page}/index${id ? '?id=' + encodeURIComponent(id) : ''}` }).catch(warn);
}
export function copyText(value: string) {
  void Taro.setClipboardData({ data: value }).catch(() => { void Taro.showToast({ title: '复制失败，请重试', icon: 'none' }); });
}
