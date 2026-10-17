import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { getCurrentGPSLocation, LocationCoordinates } from '../services/location';
import { getDeviceTelemetry } from '../services/device';
import { markAttendanceCheckIn } from '../services/api';
import { CloseIcon, FlipCameraIcon, CheckIcon, LocationPinIcon, GlobeIcon } from '../components/SvgIcons';

const { width, height } = Dimensions.get('window');

interface AttendanceCameraScreenProps {
  userId: string;
  isRemote: boolean;
  onSuccess: (result: any) => void;
  onCancel: () => void;
}

export default function AttendanceCameraScreen({
  userId,
  isRemote,
  onSuccess,
  onCancel,
}: AttendanceCameraScreenProps) {
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [coords, setCoords] = useState<LocationCoordinates | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [locLoading, setLocLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any | null>(null);

  const cameraRef = useRef<CameraView>(null);

  const handleRequestPermission = async () => {
    if (permission && !permission.canAskAgain) {
      await Linking.openSettings();
    } else {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          'Camera Access Required',
          'Please enable camera access in your device settings to scan your face for attendance.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [loc, tele] = await Promise.all([
          getCurrentGPSLocation(),
          getDeviceTelemetry(),
        ]);
        setCoords(loc);
        setDeviceId(tele.device_id);
      } catch (err: any) {
        Alert.alert('GPS Notice', err.message || 'Could not acquire current location.');
      } finally {
        setLocLoading(false);
      }
    })();
  }, []);

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
        <Text style={styles.permissionText}>Camera permission is required to scan your face for attendance.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={handleRequestPermission}>
          <Text style={styles.permissionButtonText}>Enable Camera in Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelTextButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCamera = () => {
    setFacing(current => (current === 'front' ? 'back' : 'front'));
  };

  const handleCaptureAttendance = async () => {
    if (!cameraRef.current || isVerifying) return;

    if (!coords && !isRemote) {
      Alert.alert('Acquiring Location', 'Please wait a moment while high-accuracy GPS coordinates are resolved.');
      return;
    }

    try {
      setIsVerifying(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        throw new Error('Failed to capture camera frame');
      }

      const result = await markAttendanceCheckIn({
        imageUri: photo.uri,
        latitude: coords?.latitude || 0.0,
        longitude: coords?.longitude || 0.0,
        deviceId,
        isMocked: coords?.isMocked || false,
      });

      setVerifyResult(result);
      setTimeout(() => {
        onSuccess(result);
      }, 1600);
    } catch (err: any) {
      Alert.alert(
        'Check-In Failed',
        err.message || 'Face scan verification failed. Please align your face within the frame and ensure proper lighting.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Header HUD */}
        <View style={styles.overlayHeader}>
          <TouchableOpacity style={styles.closeBtn} onPress={onCancel}>
            <CloseIcon size={18} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.badgeContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {isRemote ? (
                <GlobeIcon size={14} color="#93c5fd" />
              ) : (
                <LocationPinIcon size={14} color="#93c5fd" />
              )}
              <Text style={styles.badgeText}>
                {locLoading
                  ? 'ACQUIRING GPS...'
                  : isRemote
                  ? 'REMOTE (GEOFENCE WAIVED)'
                  : 'ON-SITE (200M GEOFENCE)'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.flipBtn} onPress={toggleCamera}>
            <FlipCameraIcon size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Center Scanner HUD */}
        <View style={styles.ovalContainer}>
          <View
            style={[
              styles.scannerOval,
              verifyResult ? styles.scannerOvalSuccess : isVerifying ? styles.scannerOvalActive : null,
            ]}
          >
            <View style={styles.hudCornerTL} />
            <View style={styles.hudCornerTR} />
            <View style={styles.hudCornerBL} />
            <View style={styles.hudCornerBR} />
          </View>

          <Text style={styles.instructionText}>
            {verifyResult
              ? `Match: ${(verifyResult.similarity_score * 100).toFixed(1)}% - ${verifyResult.status.toUpperCase()}`
              : isVerifying
              ? 'Analyzing facial biometrics with pgvector...'
              : 'Position face in frame & press punch'}
          </Text>
        </View>

        {/* Bottom Action Bar */}
        <View style={styles.controlsContainer}>
          {isVerifying ? (
            <View style={styles.verifyingCard}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.verifyingText}>Verifying Face & Geofence...</Text>
            </View>
          ) : verifyResult ? (
            <View style={styles.resultCard}>
              <CheckIcon size={28} color="#059669" />
              <Text style={styles.resultTitle}>Attendance Recorded!</Text>
              <Text style={styles.resultSubtitle}>
                {verifyResult.verification_type === 'face_geo'
                  ? `On-Site Verified (${verifyResult.distance_from_office_meters?.toFixed(0) || '<200'}m from office)`
                  : 'Remote Verified'}
              </Text>
            </View>
          ) : (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.punchButton, locLoading && styles.punchButtonDisabled]}
                onPress={handleCaptureAttendance}
                disabled={locLoading}
              >
                <View style={styles.punchInner}>
                  <Text style={styles.punchText}>PUNCH</Text>
                </View>
              </TouchableOpacity>
            </View>
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
  badgeContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  badgeText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  scannerOval: {
    width: width * 0.72,
    height: height * 0.44,
    borderRadius: width * 0.36,
    borderWidth: 2,
    borderColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.04)',
    position: 'relative',
  },
  scannerOvalActive: {
    borderColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  scannerOvalSuccess: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
  },
  hudCornerTL: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#38bdf8',
  },
  hudCornerTR: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#38bdf8',
  },
  hudCornerBL: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#38bdf8',
  },
  hudCornerBR: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#38bdf8',
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  controlsContainer: {
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    alignItems: 'center',
  },
  punchButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  punchButtonDisabled: {
    opacity: 0.5,
  },
  punchInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  punchText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  verifyingCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  verifyingText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  resultCard: {
    backgroundColor: 'rgba(20, 83, 45, 0.95)',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 18,
    alignItems: 'center',
  },
  resultCheck: {
    color: '#4ade80',
    fontSize: 32,
    fontWeight: '900',
  },
  resultTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  resultSubtitle: {
    color: '#86efac',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
});
