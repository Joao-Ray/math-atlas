export default defineAppConfig({
  pages: [
    'pages/home/index', 'pages/topics/index', 'pages/formulas/index', 'pages/problems/index', 'pages/study/index',
    'pages/topic/index', 'pages/problem/index', 'pages/daily/index', 'pages/papers/index', 'pages/backup/index', 'pages/privacy/index',
    'pages/review/index', 'pages/acceptance/index',
    'pages/textbooks/index',
    'pages/roadmap/index',
  ],
  window: { navigationBarTitleText: 'Lemivanta', navigationBarBackgroundColor: '#F4F1E8', navigationBarTextStyle: 'black', backgroundColor: '#F4F1E8' },
  tabBar: { color: '#68736D', selectedColor: '#255C45', backgroundColor: '#FFFDF7', borderStyle: 'white', list: [
    { pagePath: 'pages/home/index', text: '首页' }, { pagePath: 'pages/topics/index', text: '知识' },
    { pagePath: 'pages/formulas/index', text: '公式' }, { pagePath: 'pages/problems/index', text: '例题' },
    { pagePath: 'pages/study/index', text: '我的' },
  ] },
  style: 'v2',
  lazyCodeLoading: 'requiredComponents',
});
