export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '数据录入' })
  : { navigationBarTitleText: '数据录入' }
