export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/record/index',
    'pages/trend/index',
    'pages/profile/index',
    'pages/analysis/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'BodyMetrics',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#64748B',
    selectedColor: '#2563EB',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: './assets/tabbar/home.png',
        selectedIconPath: './assets/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/record/index',
        text: '录入',
        iconPath: './assets/tabbar/plus-circle.png',
        selectedIconPath: './assets/tabbar/plus-circle-active.png'
      },
      {
        pagePath: 'pages/trend/index',
        text: '趋势',
        iconPath: './assets/tabbar/trending-up.png',
        selectedIconPath: './assets/tabbar/trending-up-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: './assets/tabbar/user.png',
        selectedIconPath: './assets/tabbar/user-active.png'
      }
    ]
  }
})
