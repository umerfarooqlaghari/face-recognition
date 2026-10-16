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
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { enrollFaceReference } from '../services/api';
import { CloseIcon, FlipCameraIcon, CheckIcon } from '../components/SvgIcons';

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
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [enrollStatus, setEnrollStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const cameraRef = useRef<CameraView>(null);

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
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
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
});
