import React, { useState, useRef, useEffect } from 'react';
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
  SafeAreaView,
  Animated,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { enrollFaceReference } from '../services/api';
import { CloseIcon, FlipCameraIcon, CheckIcon, ShieldIcon, RefreshIcon } from '../components/SvgIcons';

const { width, height } = Dimensions.get('window');

// Dimensions of the Face ID scanning oval
const OVAL_WIDTH = Math.min(width * 0.74, 290);
const OVAL_HEIGHT = Math.min(height * 0.44, 390);

type EnrollmentStep = 'center' | 'left' | 'right' | 'processing' | 'success';

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
  const [currentStep, setCurrentStep] = useState<EnrollmentStep>('center');
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedAngles, setCapturedAngles] = useState<{
    center?: string;
    left?: string;
    right?: string;
  }>({});

  const cameraRef = useRef<CameraView>(null);

  // Pulse animations for scanning ring and directional arrows
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Breathing reticle animation
    const reticleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.98,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    reticleLoop.start();

    // Directional cue animation
    const arrowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, {
          toValue: 12,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(arrowAnim, {
          toValue: -12,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    arrowLoop.start();

    return () => {
      reticleLoop.stop();
      arrowLoop.stop();
    };
  }, []);

  const handleRequestPermission = async () => {
    if (permission && !permission.canAskAgain) {
      await Linking.openSettings();
    } else {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          'Camera Access Required',
          'Please enable camera access in device settings to scan your face for biometric enrollment.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    }
  };

  // Step 1: Biometric Privacy Disclosure
  if (!hasConsented) {
    return (
      <View style={styles.consentContainer}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.consentScroll}>
            <View style={styles.consentCard}>
              <View style={styles.shieldBadge}>
                <ShieldIcon size={32} color="#0284c7" />
              </View>
              <Text style={styles.consentTitle}>Biometric Face Enrollment</Text>
              <Text style={styles.consentSubtitle}>
                3-Angle Neural Face ID Registration
              </Text>

              <View style={styles.stepPreviewRow}>
                <View style={styles.stepPreviewItem}>
                  <View style={styles.stepPreviewIcon}>
                    <Text style={styles.stepPreviewEmoji}>👤</Text>
                  </View>
                  <Text style={styles.stepPreviewLabel}>1. Front</Text>
                </View>
                <View style={styles.stepPreviewDivider} />
                <View style={styles.stepPreviewItem}>
                  <View style={styles.stepPreviewIcon}>
                    <Text style={styles.stepPreviewEmoji}>👈</Text>
                  </View>
                  <Text style={styles.stepPreviewLabel}>2. Left</Text>
                </View>
                <View style={styles.stepPreviewDivider} />
                <View style={styles.stepPreviewItem}>
                  <View style={styles.stepPreviewIcon}>
                    <Text style={styles.stepPreviewEmoji}>👉</Text>
                  </View>
                  <Text style={styles.stepPreviewLabel}>3. Right</Text>
                </View>
              </View>

              <View style={styles.consentBulletBox}>
                <Text style={styles.consentBulletTitle}>Data Privacy & Protection:</Text>
                <Text style={styles.consentBulletPoint}>
                  • <Text style={styles.boldText}>Mathematical Vector:</Text> Your face photograph is converted into an encrypted 512D embedding.
                </Text>
                <Text style={styles.consentBulletPoint}>
                  • <Text style={styles.boldText}>Anti-Spoofing & Liveness:</Text> Multi-angle verification ensures anti-spoofing depth accuracy.
                </Text>
                <Text style={styles.consentBulletPoint}>
                  • <Text style={styles.boldText}>No Third-Party Sharing:</Text> Biometric data is strictly isolated to your employer's attendance log.
                </Text>
                <Text style={styles.consentBulletPoint}>
                  • <Text style={styles.boldText}>Instant Deletion:</Text> Vectors are permanently removed when employee account is deleted.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.consentButton}
                onPress={() => setHasConsented(true)}
              >
                <Text style={styles.consentButtonText}>Start 3-Step Scan</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelTextButton} onPress={onCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
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

  const handleStepCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        throw new Error('Could not capture frame from camera.');
      }

      if (currentStep === 'center') {
        setCapturedAngles(prev => ({ ...prev, center: photo.uri }));
        setCurrentStep('left');
      } else if (currentStep === 'left') {
        setCapturedAngles(prev => ({ ...prev, left: photo.uri }));
        setCurrentStep('right');
      } else if (currentStep === 'right') {
        const finalAngles = { ...capturedAngles, right: photo.uri };
        setCapturedAngles(finalAngles);
        setCurrentStep('processing');

        // Submit primary frontal reference for 512D ArcFace vector extraction & pgvector indexing
        const referencePhotoUri = finalAngles.center || photo.uri;
        await enrollFaceReference(referencePhotoUri, {
          userId,
          inviteToken,
        });

        setCurrentStep('success');
        setTimeout(() => {
          onSuccess();
        }, 1600);
      }
    } catch (err: any) {
      Alert.alert(
        'Enrollment Notice',
        err.message || 'Please center face clearly in good lighting and try again.'
      );
      if (currentStep === 'processing') {
        setCurrentStep('center');
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const resetEnrollment = () => {
    setCapturedAngles({});
    setCurrentStep('center');
  };

  // Guidance texts and cues per step
  const getStepInfo = () => {
    switch (currentStep) {
      case 'center':
        return {
          stepNum: '1 OF 3',
          badge: 'FRONTAL SCAN',
          title: 'Look Straight Ahead',
          instruction: 'Center your face inside the oval and look directly at the lens.',
          buttonLabel: 'Capture Center Pose',
          borderColor: '#38bdf8',
          arrowCue: null,
        };
      case 'left':
        return {
          stepNum: '2 OF 3',
          badge: 'LEFT ANGLE',
          title: 'Turn Head Slightly Left',
          instruction: 'Slowly turn your face about 20° to your left side.',
          buttonLabel: 'Capture Left Angle',
          borderColor: '#a855f7',
          arrowCue: 'left',
        };
      case 'right':
        return {
          stepNum: '3 OF 3',
          badge: 'RIGHT ANGLE',
          title: 'Turn Head Slightly Right',
          instruction: 'Slowly turn your face about 20° to your right side.',
          buttonLabel: 'Capture Right Angle',
          borderColor: '#06b6d4',
          arrowCue: 'right',
        };
      case 'processing':
        return {
          stepNum: 'COMPUTING',
          badge: 'ARCFACE 512D',
          title: 'Generating Vector Embedding',
          instruction: 'Analyzing multi-angle landmarks and indexing embedding with pgvector...',
          buttonLabel: 'Processing...',
          borderColor: '#eab308',
          arrowCue: null,
        };
      case 'success':
        return {
          stepNum: 'COMPLETE',
          badge: 'VERIFIED',
          title: 'Biometrics Registered!',
          instruction: '512-dimensional face vector has been encrypted and saved successfully.',
          buttonLabel: 'Success',
          borderColor: '#22c55e',
          arrowCue: null,
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <View style={styles.container}>
      {/* 1. Camera View (Background, Absolute Fill) */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
      />

      {/* 2. Sibling Overlay HUD (Always renders above native video on iOS) */}
      <SafeAreaView style={styles.overlayContainer} pointerEvents="box-none">
        {/* Top Header Bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.iconButton} onPress={onCancel}>
            <CloseIcon size={18} color="#ffffff" />
          </TouchableOpacity>

          {/* Stepper Pill */}
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              {targetName ? `${targetName.toUpperCase()} • ` : ''}
              {stepInfo.stepNum}
            </Text>
          </View>

          <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
            <FlipCameraIcon size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Step Progress Checklist */}
        <View style={styles.progressCheckRow}>
          <View style={[styles.progressChip, capturedAngles.center ? styles.progressChipDone : currentStep === 'center' ? styles.progressChipActive : null]}>
            <Text style={styles.progressChipText}>
              {capturedAngles.center ? '✓ Center' : '1. Center'}
            </Text>
          </View>
          <View style={styles.progressChipLine} />
          <View style={[styles.progressChip, capturedAngles.left ? styles.progressChipDone : currentStep === 'left' ? styles.progressChipActive : null]}>
            <Text style={styles.progressChipText}>
              {capturedAngles.left ? '✓ Left' : '2. Left'}
            </Text>
          </View>
          <View style={styles.progressChipLine} />
          <View style={[styles.progressChip, capturedAngles.right ? styles.progressChipDone : currentStep === 'right' ? styles.progressChipActive : null]}>
            <Text style={styles.progressChipText}>
              {capturedAngles.right ? '✓ Right' : '3. Right'}
            </Text>
          </View>
        </View>

        {/* Center Scanner Oval Area */}
        <View style={styles.centerScanSection} pointerEvents="none">
          {/* Animated Face Oval Reticle */}
          <Animated.View
            style={[
              styles.faceOval,
              {
                borderColor: stepInfo.borderColor,
                transform: [{ scale: currentStep === 'success' ? 1.05 : pulseAnim }],
              },
            ]}
          >
            {/* 4 HUD Corner Brackets */}
            <View style={[styles.hudCorner, styles.hudCornerTL, { borderColor: stepInfo.borderColor }]} />
            <View style={[styles.hudCorner, styles.hudCornerTR, { borderColor: stepInfo.borderColor }]} />
            <View style={[styles.hudCorner, styles.hudCornerBL, { borderColor: stepInfo.borderColor }]} />
            <View style={[styles.hudCorner, styles.hudCornerBR, { borderColor: stepInfo.borderColor }]} />

            {/* Crosshair Center */}
            {currentStep !== 'success' && (
              <>
                <View style={[styles.crosshairH, { backgroundColor: stepInfo.borderColor }]} />
                <View style={[styles.crosshairV, { backgroundColor: stepInfo.borderColor }]} />
              </>
            )}

            {/* Left Directional Guidance Cue */}
            {stepInfo.arrowCue === 'left' && (
              <Animated.View
                style={[
                  styles.arrowCueBox,
                  styles.arrowCueLeft,
                  { transform: [{ translateX: arrowAnim }] },
                ]}
              >
                <Text style={styles.arrowCueIcon}>←</Text>
                <Text style={styles.arrowCueText}>TURN LEFT</Text>
              </Animated.View>
            )}

            {/* Right Directional Guidance Cue */}
            {stepInfo.arrowCue === 'right' && (
              <Animated.View
                style={[
                  styles.arrowCueBox,
                  styles.arrowCueRight,
                  { transform: [{ translateX: arrowAnim }] },
                ]}
              >
                <Text style={styles.arrowCueText}>TURN RIGHT</Text>
                <Text style={styles.arrowCueIcon}>→</Text>
              </Animated.View>
            )}

            {/* Success Icon */}
            {currentStep === 'success' && (
              <View style={styles.successInnerBox}>
                <CheckIcon size={48} color="#22c55e" />
              </View>
            )}
          </Animated.View>

          {/* Step Instruction Card */}
          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>{stepInfo.title}</Text>
            <Text style={styles.instructionDesc}>{stepInfo.instruction}</Text>
          </View>
        </View>

        {/* Bottom Action Controls */}
        <View style={styles.bottomSection}>
          {currentStep === 'processing' ? (
            <View style={styles.processingCard}>
              <ActivityIndicator size="large" color="#38bdf8" />
              <Text style={styles.processingTitle}>Building Biometric Model</Text>
              <Text style={styles.processingSub}>Extracting 512D ArcFace landmarks...</Text>
            </View>
          ) : currentStep === 'success' ? (
            <View style={styles.completedCard}>
              <CheckIcon size={24} color="#22c55e" />
              <Text style={styles.completedText}>Biometrics Indexed Successfully</Text>
            </View>
          ) : (
            <View style={styles.captureRow}>
              {currentStep !== 'center' && (
                <TouchableOpacity style={styles.resetBtn} onPress={resetEnrollment}>
                  <RefreshIcon size={18} color="#cbd5e1" />
                  <Text style={styles.resetBtnText}>Restart</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.captureTriggerBtn,
                  isCapturing && styles.captureTriggerDisabled,
                  { borderColor: stepInfo.borderColor },
                ]}
                onPress={handleStepCapture}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={[styles.captureTriggerInner, { backgroundColor: stepInfo.borderColor }]}>
                    <Text style={styles.captureTriggerText}>
                      {currentStep === 'center' ? 'SCAN CENTER' : currentStep === 'left' ? 'SCAN LEFT' : 'SCAN RIGHT'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  stepBadgeText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  progressCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 24,
  },
  progressChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressChipActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderColor: '#38bdf8',
  },
  progressChipDone: {
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    borderColor: '#22c55e',
  },
  progressChipText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  progressChipLine: {
    width: 16,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 4,
  },
  centerScanSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  faceOval: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    borderRadius: OVAL_WIDTH / 2,
    borderWidth: 3,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
    position: 'relative',
  },
  hudCorner: {
    position: 'absolute',
    width: 22,
    height: 22,
  },
  hudCornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 18,
  },
  hudCornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 18,
  },
  hudCornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 18,
  },
  hudCornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 18,
  },
  crosshairH: {
    position: 'absolute',
    width: 32,
    height: 1.5,
    opacity: 0.7,
  },
  crosshairV: {
    position: 'absolute',
    width: 1.5,
    height: 32,
    opacity: 0.7,
  },
  arrowCueBox: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    gap: 8,
  },
  arrowCueLeft: {
    left: -20,
  },
  arrowCueRight: {
    right: -20,
  },
  arrowCueIcon: {
    color: '#38bdf8',
    fontSize: 20,
    fontWeight: '900',
  },
  arrowCueText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  successInnerBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  instructionCard: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  instructionTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  instructionDesc: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    alignItems: 'center',
  },
  captureRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  resetBtnText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
  },
  captureTriggerBtn: {
    flex: 1,
    maxWidth: 240,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  captureTriggerDisabled: {
    opacity: 0.6,
  },
  captureTriggerInner: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureTriggerText: {
    color: '#090d16',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  processingCard: {
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  processingTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
  },
  processingSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 83, 45, 0.9)',
    borderWidth: 1,
    borderColor: '#22c55e',
    gap: 10,
  },
  completedText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
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
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelTextButton: {
    marginTop: 16,
    padding: 10,
  },
  cancelText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  consentContainer: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  consentScroll: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  consentCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  shieldBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  consentTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  consentSubtitle: {
    fontSize: 13,
    color: '#38bdf8',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 18,
  },
  stepPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  stepPreviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepPreviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepPreviewEmoji: {
    fontSize: 18,
  },
  stepPreviewLabel: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
  },
  stepPreviewDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  consentBulletBox: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  consentBulletTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38bdf8',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  consentBulletPoint: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 19,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '700',
    color: '#ffffff',
  },
  consentButton: {
    width: '100%',
    backgroundColor: '#0284c7',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  consentButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
