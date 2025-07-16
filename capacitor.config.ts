
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zenithworkbuddy.app',
  appName: 'Zenith Work Buddy',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a1a',
      showSpinner: true,
      spinnerColor: '#6366f1'
    },
    Camera: {
      permissions: ['camera', 'photos']
    },
    Filesystem: {
      permissions: ['camera', 'photos']
    }
  },
  android: {
    permissions: [
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.CALL_PHONE',
      'android.permission.READ_PHONE_STATE',
      'android.permission.READ_SMS',
      'android.permission.SEND_SMS',
      'android.permission.RECEIVE_SMS',
      'android.permission.READ_CONTACTS',
      'android.permission.WAKE_LOCK',
      'android.permission.VIBRATE'
    ]
  }
};

export default config;
