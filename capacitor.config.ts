
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zenithworkbuddy.app',
  appName: 'Zenith Work Buddy',
  webDir: 'dist',
  server: {
    url: 'https://253e3ffb-8163-46e7-9235-c42c4ae030c5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a1a',
      showSpinner: true,
      spinnerColor: '#6366f1'
    }
  }
};

export default config;
