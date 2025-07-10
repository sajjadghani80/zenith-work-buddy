
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.253e3ffb816346e79235c42c4ae030c5',
  appName: 'zenith-work-buddy',
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
