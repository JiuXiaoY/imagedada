import { ProSettings } from '@ant-design/pro-layout';

// Define the extended settings type
interface ExtendedProSettings extends ProSettings {
  pwa?: boolean;  // Adding the pwa property
  logo?: string;
  token:{}
}

// Define the Settings object with the correct type
const Settings: ExtendedProSettings = {
  title: 'Image Design DaDa',
  navTheme: "light",
  colorPrimary: "#722ED1",
  layout: 'top',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  pwa: true,  // Using the pwa property
  logo: 'http://bt.imagegem.cn/favicon.png',
  iconfontUrl: '',
  token: {
    // 参见ts声明，demo 见文档，通过token 修改样式
    // https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F
  },
};

export default Settings;



