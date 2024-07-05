export default [
  { path: '/', name: '主页', icon: 'FireOutlined', component: './Index' },
  {
    path: '/index/detail/:id',
    name: '应用详情',
    icon: 'FireOutlined',
    component: './Index/Detail',
    hideInMenu: true,
  },
  {
    path: '/addPage/addAppPage',
    name: '创建应用',
    icon: 'FireOutlined',
    component: './AddPage/AddAppPage',
  },
  {
    path: '/admin',
    icon: 'HomeOutlined',
    name: '管理页面',
    routes: [
      { name: '应用管理', path: '/admin/app', component: './Admin/App' },
      { name: '结果管理', path: '/admin/scoringResult', component: './Admin/ScoringResult' },
      { name: '用户回答管理', path: '/admin/userAnswer', component: './Admin/UserAnswer' },
      { name: '应用题库管理', path: '/admin/question', component: './Admin/Question' },
    ],
    access: 'canAdmin',
  },
  {
    path: '/addPage',
    icon: 'HomeOutlined',
    name: '添加',
    routes: [
      { name: '修改应用', path: '/addPage/addAppPage/:id', component: './AddPage/AddAppPage' },
      {
        name: '创建题目',
        path: '/addPage/addQuestionPage/:id',
        component: './AddPage/AddQuestionPage',
      },
      {
        name: '创建评分',
        path: '/addPage/addScoringResultPage/:id',
        component: './AddPage/AddScoringResultPage',
      },
    ],
    access: 'canUser',
    hideInMenu: true,
  },
  {
    path: '/doAnswer/:id',
    icon: 'FireOutlined',
    name: '答题',
    component: './DoAnswer',
    hideInMenu: true,
  },
  {
    path: '/doAnswer/doAnswerResult/:id',
    icon: 'FireOutlined',
    name: '答题结果',
    component: './DoAnswer/DoAnswerResult',
    hideInMenu: true,
  },
  {
    path: '/userAnswerRecord',
    icon: 'FireOutlined',
    name: '答题记录',
    component: './UserAnswerRecord',
  },
  {
    path: '/appStatistic',
    icon: 'FireOutlined',
    name: '统计分析',
    component: './AppStatistic',
    access: 'canAdmin',
  },
  {
    path: '/user',
    layout: false,
    routes: [
      { name: '登录', path: '/user/login', component: './User/Login' },
      { name: '注册', path: '/user/register', component: './User/Register' },
    ],
  },
  { path: '*', layout: false, component: './404' },
];
