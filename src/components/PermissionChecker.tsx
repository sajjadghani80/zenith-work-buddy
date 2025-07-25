import React, { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mic, AlertTriangle, CheckCircle } from 'lucide-react';

interface PermissionCheckerProps {
  onPermissionGranted: () => void;
  children: React.ReactNode;
}

const PermissionChecker: React.FC<PermissionCheckerProps> = ({
  onPermissionGranted,
  children
}) => {
  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied' | 'prompt'>('checking');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const device = await Device.getInfo();
      setIsMobile(device.platform !== 'web');

      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('getUserMedia not supported');
        setPermissionStatus('denied');
        return;
      }

      // Check microphone permission status without requesting access
      try {
        // For web browsers, try to check permission status first if available
        if ('permissions' in navigator && device.platform === 'web') {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          console.log('Permission status:', permissionStatus.state);
          
          if (permissionStatus.state === 'granted') {
            setPermissionStatus('granted');
            onPermissionGranted();
            return;
          } else if (permissionStatus.state === 'denied') {
            setPermissionStatus('denied');
            return;
          }
        }
        
        // If permission status is unknown or we're on mobile, we need to prompt
        setPermissionStatus('prompt');
        
      } catch (error) {
        console.log('Permission check error:', error);
        // If we can't check permissions, assume we need to prompt
        setPermissionStatus('prompt');
      }
    } catch (error) {
      console.error('Failed to check device info:', error);
      setPermissionStatus('prompt');
    }
  };

  const requestPermission = async () => {
    try {
      console.log('Requesting microphone permission...');
      
      // Use getUserMedia to trigger the native permission popup
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Test successful, stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      console.log('Permission granted successfully');
      setPermissionStatus('granted');
      onPermissionGranted();
    } catch (error) {
      console.error('Permission denied:', error);
      const errorMessage = (error as Error).message;
      console.log('Error details:', errorMessage);
      
      // Check if the error is specifically about permission denial
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setPermissionStatus('denied');
      } else {
        // Other errors might be due to no microphone available
        setPermissionStatus('denied');
      }
    }
  };

  if (permissionStatus === 'checking') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3" style={{ color: 'hsl(var(--app-text-primary))' }}>
          <Mic className="w-5 h-5 animate-pulse" />
          <span>Checking microphone permissions...</span>
        </div>
      </div>
    );
  }

  if (permissionStatus === 'granted') {
    return <>{children}</>;
  }

  return (
    <div className="p-6 space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {permissionStatus === 'denied' ? (
            <>
              <strong>Microphone Access Denied</strong>
              <br />
              {isMobile ? (
                <>
                  To use Meeting Assist, please:
                  <br />
                  1. Go to your device Settings → Apps → Zenith Work Buddy → Permissions
                  <br />
                  2. Enable Microphone permission
                  <br />
                  3. Return to this app and try again
                </>
              ) : (
                <>
                  To use Meeting Assist, please enable microphone access in your browser:
                  <br />
                  1. Click the microphone icon in your browser's address bar
                  <br />
                  2. Select "Allow" for microphone access
                  <br />
                  3. Refresh the page if needed
                </>
              )}
            </>
          ) : (
            <>
              <strong>Microphone Permission Required</strong>
              <br />
              Meeting Assist needs microphone access to record and transcribe your meetings.
              {isMobile && (
                <>
                  <br />
                  <br />
                  <strong>Note:</strong> When you tap "Request Permission", your device will ask for microphone access. Please tap "Allow" to continue.
                </>
              )}
            </>
          )}
        </AlertDescription>
      </Alert>

      <div className="flex flex-col gap-3">
        <Button
          onClick={requestPermission}
          className="w-full"
          style={{ backgroundColor: 'hsl(var(--app-primary))' }}
        >
          <Mic className="w-4 h-4 mr-2" />
          Request Microphone Permission
        </Button>
        
        <Button
          onClick={checkPermissions}
          variant="outline"
          className="w-full"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Check Permission Status
        </Button>
      </div>
    </div>
  );
};

export default PermissionChecker;