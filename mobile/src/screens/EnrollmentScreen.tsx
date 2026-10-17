import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { enrollFaceReference } from '../services/api';
import { CloseIcon, FlipCameraIcon, CheckIcon, ShieldIcon } from '../components/SvgIcons';

const { width, height } = Dimensions.get('window');

interface EnrollmentScreenProps {
  userId?: string;
  targetName?: string;
  inviteToken?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EnrollmentScreen({
  userId,
  targetName,
  inviteToken,
  onSuccess,
  onCancel,
}: EnrollmentScreenProps) {
  const [hasConsented, setHasConsented] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [enrollStatus, setEnrollStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const cameraRef = useRef<CameraView>(null);

  const handleRequestPermission = async () => {
    if (permission && !permission.canAskAgain) {
      await Linking.openSettings();
    } else {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          'Camera Access Required',
          'Please enable camera access in your device settings to capture your face scan.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    }
  };

  // 1. Apple App Store Guideline 5.1.2 & Biometric Privacy Disclosure
  if (!hasConsented) {
    return (
      <View style={styles.consentContainer}>
        <ScrollView contentContainerStyle={styles.consentScroll}>
          <View style={styles.consentCard}>
            <View style={styles.shieldBadge}>
              <ShieldIcon size={32} color="#0284c7" />
            </View>
            <Text style={styles.consentTitle}>Biometric Face Enrollment</Text>
            <Text style={styles.consentSubtitle}>
              Employee Identity Verification Consent
            </Text>

            <View style={styles.consentBulletBox}>
              <Text style={styles.consentBulletTitle}>Data Privacy & Protection Notice:</Text>
              <Text style={styles.consentBulletPoint}>
                • <Text style={styles.boldText}>Mathematical Representation:</Text> Your face photograph is converted on-device into an encrypted 512-dimensional vector embedding.
              </Text>
              <Text style={styles.consentBulletPoint}>
                • <Text style={styles.boldText}>Strict Attendance Use:</Text> Vector data is used exclusively to verify employee attendance and prevent unauthorized proxy check-ins.
              </Text>
              <Text style={styles.consentBulletPoint}>
                • <Text style={styles.boldText}>No Third-Party Sharing:</Text> We do not sell, track, or share your biometric data with any external third parties or advertisers.
              </Text>
              <Text style={styles.consentBulletPoint}>
                • <Text style={styles.boldText}>Erasure & Retention:</Text> Embeddings are retained only during your employment and permanently deleted upon account termination.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.consentButton}
              onPress={() => setHasConsented(true)}
            >
              <Text style={styles.consentButtonText}>I Consent & Proceed</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelTextButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>Camera permission is required to capture reference face scan.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermission}>
          <Text style={styles.permissionButtonText}>Enable Camera in Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelTextButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const captureAndEnroll = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      setEnrollStatus('uploading');

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        throw new Error('Failed to capture frame from camera');
      }

      // Upload to backend ArcFace extraction endpoint
      await enrollFaceReference(photo.uri, {
        userId,
        inviteToken,
      });

      setEnrollStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setEnrollStatus('idle');
      Alert.alert(
        'Enrollment Failed',
        err.message || 'Image rejected by validation. Ensure good lighting and hold still.'
      );
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Top Header */}
        <View style={styles.overlayHeader}>
          <TouchableOpacity style={styles.closeBtn} onPress={onCancel}>
            <CloseIcon size={18} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.guideBadge}>
            <Text style={styles.guideBadgeText}>
              {targetName ? `ENROLL: ${targetName.toUpperCase()}` : 'BIOMETRIC ENROLLMENT'}
            </Text>
          </View>
          <TouchableOpacity style={styles.flipBtn} onPress={toggleCameraFacing}>
            <FlipCameraIcon size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Center Face Oval Guide */}
        <View style={styles.ovalContainer}>
          <View style={[styles.faceOval, enrollStatus === 'success' && styles.faceOvalSuccess]}>
            <View style={styles.crosshairH} />
            <View style={styles.crosshairV} />
          </View>
          <Text style={styles.instructionText}>
            {enrollStatus === 'uploading'
              ? 'Analyzing facial landmarks & computing 512D ArcFace vector...'
              : enrollStatus === 'success'
              ? 'Face Reference Enrolled Successfully'
              : 'Fit your face within the oval. Look directly at the camera.'}
          </Text>
        </View>

        {/* Bottom Controls */}
        <View style={styles.controlsContainer}>
          {enrollStatus === 'uploading' ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.loadingText}>Registering with pgvector...</Text>
            </View>
          ) : enrollStatus === 'success' ? (
            <View style={styles.successBox}>
              <CheckIcon size={26} color="#059669" />
              <Text style={styles.successText}>Enrolled & Indexed</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={captureAndEnroll}
              disabled={isCapturing}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    color: '#cbd5e1',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelTextButton: {
    marginTop: 16,
    padding: 8,
  },
  cancelText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  guideBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  guideBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  flipBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipBtnText: {
    fontSize: 20,
  },
  ovalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceOval: {
    width: width * 0.7,
    height: height * 0.42,
    borderRadius: width * 0.35,
    borderWidth: 3,
    borderColor: '#38bdf8',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  faceOvalSuccess: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  crosshairH: {
    position: 'absolute',
    width: 30,
    height: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.5)',
  },
  crosshairV: {
    position: 'absolute',
    width: 1,
    height: 30,
    backgroundColor: 'rgba(56, 189, 248, 0.5)',
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  controlsContainer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#38bdf8',
  },
  loadingBox: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
  },
  loadingText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  successBox: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(20, 83, 45, 0.85)',
    borderRadius: 16,
  },
  successIcon: {
    color: '#4ade80',
    fontSize: 28,
    fontWeight: '900',
  },
  successText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  consentContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  consentScroll: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  consentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  shieldBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  consentTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  consentSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  consentBulletBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  consentBulletTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1e3a8a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  consentBulletPoint: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: '700',
    color: '#0f172a',
  },
  consentButton: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  consentButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
