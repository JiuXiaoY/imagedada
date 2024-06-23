export default [
  { path: '/', name: '数据分析（同步）', icon: 'table', component: './Index' },
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
