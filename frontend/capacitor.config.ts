import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medev.app',
  appName: 'MeDev',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    iosScheme: 'capacitor',
    // cleartext только для debug — в release убрать
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#0a0a0c',
    },
  },
};

export default config;
