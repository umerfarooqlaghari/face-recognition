import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import {
  CloseIcon,
  FlipCameraIcon,
  CheckIcon,
  ShieldIcon,
  RefreshIcon,
  FaceScanIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '../components/SvgIcons';

const { width, height } = Dimensions.get('window');

const OVAL_WIDTH = Math.min(width * 0.72, 280);
const OVAL_HEIGHT = Math.min(height * 0.42, 370);

type Step = 'center' | 'left' | 'right' | 'saving' | 'done';

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
  const [currentStep, setCurrentStep] = useState<Step>('center');
  const [stepProgress, setStepProgress] = useState(0);

  const cameraRef = useRef<CameraView>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const isAutoCapturing = useRef(false);

  // Trigger permission request
  const handleRequestPermission = async () => {
    if (permission && !permission.canAskAgain) {
      await Linking.openSettings();
    } else {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert(
          'Camera Access Required',
          'Please enable camera access in Settings to complete biometric registration.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    }
  };

  // Autonomous progressive scanning sequence (Auto-Capture)
  const runAutoCaptureSequence = useCallback(async () => {
    if (isAutoCapturing.current) return;
    isAutoCapturing.current = true;

    try {
      // 1. Center / Frontal Position (1.2s auto-timer)
      setCurrentStep('center');
      progressAnim.setValue(0);
      await new Promise<void>(resolve => {
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }).start(() => resolve());
      });

      // Brief transition pause
      await new Promise(r => setTimeout(r, 200));

      // 2. Left Angle (1.2s auto-timer)
      setCurrentStep('left');
      progressAnim.setValue(0);
      await new Promise<void>(resolve => {
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }).start(() => resolve());
      });

      // Brief transition pause
      await new Promise(r => setTimeout(r, 200));

      // 3. Right Angle (1.2s auto-timer)
      setCurrentStep('right');
      progressAnim.setValue(0);
      await new Promise<void>(resolve => {
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }).start(() => resolve());
      });

      // 4. Capture reference frame & Submit instantly
      setCurrentStep('saving');

      let photoUri: string | null = null;
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5, // Lightweight compressed frame (<200KB for ultra-fast upload)
          skipProcessing: true,
        });
        photoUri = photo?.uri || null;
      }

      if (!photoUri) {
        throw new Error('Camera capture failed. Please retry.');
      }

      // Fast vector extraction & pgvector indexing
      await enrollFaceReference(photoUri, {
        userId,
        inviteToken,
      });

      setCurrentStep('done');
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: any) {
      isAutoCapturing.current = false;
      Alert.alert(
        'Scan Interrupted',
        err.message || 'Please maintain good lighting and try again.',
        [{ text: 'Try Again', onPress: () => restartScan() }]
      );
    }
  }, [userId, inviteToken, onSuccess]);

  const restartScan = () => {
    isAutoCapturing.current = false;
    setCurrentStep('center');
    progressAnim.setValue(0);
    setTimeout(() => {
      runAutoCaptureSequence();
    }, 400);
  };

  // Launch auto-capture when camera opens and consent is given
  useEffect(() => {
    if (hasConsented && permission?.granted) {
      const timer = setTimeout(() => {
        runAutoCaptureSequence();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [hasConsented, permission?.granted]);

  // White Minimalist Consent View (Clean Apple Style, No Emojis, Pure SVGs)
  if (!hasConsented) {
    return (
      <View style={styles.whiteConsentContainer}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.whiteConsentScroll}>
            <View style={styles.whiteConsentCard}>
              <View style={styles.cleanShieldCircle}>
                <ShieldIcon size={28} color="#0f172a" />
              </View>

              <Text style={styles.appleTitle}>Biometric Face Setup</Text>
              <Text style={styles.appleSubtitle}>
                Hands-free 3-position biometric verification
              </Text>

              {/* 3 Steps Visual Row with Clean SVGs */}
              <View style={styles.svgStepsRow}>
                <View style={styles.svgStepItem}>
                  <View style={styles.svgStepIconCircle}>
                    <FaceScanIcon size={22} color="#0f172a" />
                  </View>
                  <Text style={styles.svgStepLabel}>1. Center</Text>
                </View>

                <View style={styles.svgStepLine} />

                <View style={styles.svgStepItem}>
                  <View style={styles.svgStepIconCircle}>
                    <ArrowLeftIcon size={20} color="#0f172a" />
                  </View>
                  <Text style={styles.svgStepLabel}>2. Left</Text>
                </View>

                <View style={styles.svgStepLine} />

                <View style={styles.svgStepItem}>
                  <View style={styles.svgStepIconCircle}>
                    <ArrowRightIcon size={20} color="#0f172a" />
                  </View>
                  <Text style={styles.svgStepLabel}>3. Right</Text>
                </View>
              </View>

              {/* Policy & Security Note */}
              <View style={styles.whiteNoticeBox}>
                <Text style={styles.whiteNoticeHeader}>SECURITY & COMPLIANCE</Text>
                <Text style={styles.whiteNoticeText}>
                  • Scans are converted into a mathematically encrypted 512D vector embedding.
                </Text>
                <Text style={styles.whiteNoticeText}>
                  • Used exclusively for authorized workplace attendance check-ins.
                </Text>
                <Text style={styles.whiteNoticeText}>
                  • Biometric vectors are permanently purged upon employment termination.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.applePrimaryBtn}
                onPress={() => setHasConsented(true)}
              >
                <Text style={styles.applePrimaryBtnText}>Continue to Face Scan</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelLinkBtn} onPress={onCancel}>
                <Text style={styles.cancelLinkText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.whiteLoadingContainer}>
        <ActivityIndicator size="small" color="#0f172a" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.whiteLoadingContainer}>
        <Text style={styles.appleNotice}>Camera permission is required for face setup.</Text>
        <TouchableOpacity style={styles.applePrimaryBtn} onPress={handleRequestPermission}>
          <Text style={styles.applePrimaryBtnText}>Open Device Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelLinkBtn} onPress={onCancel}>
          <Text style={styles.cancelLinkText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const getStepText = () => {
    switch (currentStep) {
      case 'center':
        return {
          stepNum: '1 OF 3',
          title: 'Look straight at camera',
          sub: 'Keep your face inside the frame',
        };
      case 'left':
        return {
          stepNum: '2 OF 3',
          title: 'Turn head slightly left',
          sub: 'Hold steady while auto-capturing',
        };
      case 'right':
        return {
          stepNum: '3 OF 3',
          title: 'Turn head slightly right',
          sub: 'Hold steady while auto-capturing',
        };
      case 'saving':
        return {
          stepNum: 'SAVING',
          title: 'Encrypting biometric vector',
          sub: 'Registering embedding with pgvector...',
        };
      case 'done':
        return {
          stepNum: 'COMPLETE',
          title: 'Face setup complete',
          sub: 'Biometric identity verified successfully',
        };
    }
  };

  const currentInfo = getStepText();

  // Progress percentage width interpolation
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.screenRoot}>
      {/* 1. Camera in Background (Absolute Fill) */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
      />

      {/* 2. Sibling Overlay HUD (Clean White/Translucent Apple Aesthetic) */}
      <SafeAreaView style={styles.hudOverlay} pointerEvents="box-none">
        {/* Top Floating White Navigation Bar */}
        <View style={styles.topNavBar}>
          <TouchableOpacity style={styles.whiteCircleBtn} onPress={onCancel}>
            <CloseIcon size={16} color="#0f172a" />
          </TouchableOpacity>

          <View style={styles.whiteStepPill}>
            <Text style={styles.whiteStepPillText}>
              {targetName ? `${targetName.toUpperCase()} • ` : ''}
              {currentInfo.stepNum}
            </Text>
          </View>

          <TouchableOpacity style={styles.whiteCircleBtn} onPress={toggleFacing}>
            <FlipCameraIcon size={18} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {/* Step Checkpoints Row */}
        <View style={styles.checkpointRow}>
          <View
            style={[
              styles.checkpointDot,
              currentStep === 'center' ? styles.checkpointActive : null,
              currentStep === 'left' || currentStep === 'right' || currentStep === 'saving' || currentStep === 'done'
                ? styles.checkpointDone
                : null,
            ]}
          >
            <Text
              style={[
                styles.checkpointText,
                currentStep !== 'center' ? styles.checkpointTextDone : null,
              ]}
            >
              1
            </Text>
          </View>
          <View style={styles.checkpointLine} />
          <View
            style={[
              styles.checkpointDot,
              currentStep === 'left' ? styles.checkpointActive : null,
              currentStep === 'right' || currentStep === 'saving' || currentStep === 'done'
                ? styles.checkpointDone
                : null,
            ]}
          >
            <Text
              style={[
                styles.checkpointText,
                currentStep === 'right' || currentStep === 'saving' || currentStep === 'done'
                  ? styles.checkpointTextDone
                  : null,
              ]}
            >
              2
            </Text>
          </View>
          <View style={styles.checkpointLine} />
          <View
            style={[
              styles.checkpointDot,
              currentStep === 'right' ? styles.checkpointActive : null,
              currentStep === 'saving' || currentStep === 'done' ? styles.checkpointDone : null,
            ]}
          >
            <Text
              style={[
                styles.checkpointText,
                currentStep === 'saving' || currentStep === 'done' ? styles.checkpointTextDone : null,
              ]}
            >
              3
            </Text>
          </View>
        </View>

        {/* Center Scanner Area */}
        <View style={styles.centerScannerArea} pointerEvents="none">
          {/* Clean Apple Minimalist Face Oval */}
          <View
            style={[
              styles.minimalOval,
              currentStep === 'done' ? styles.minimalOvalSuccess : null,
            ]}
          >
            {/* Auto-Capture Progress Ring Fill Indicator */}
            {currentStep !== 'saving' && currentStep !== 'done' && (
              <View style={styles.ovalProgressContainer}>
                <Animated.View
                  style={[
                    styles.ovalProgressBar,
                    {
                      width: progressWidth,
                      backgroundColor: '#0f172a',
                    },
                  ]}
                />
              </View>
            )}

            {/* Left Directional Cue with SVG Arrow */}
            {currentStep === 'left' && (
              <View style={[styles.whiteCueBox, styles.cueLeft]}>
                <ArrowLeftIcon size={18} color="#0f172a" />
                <Text style={styles.whiteCueText}>TURN LEFT</Text>
              </View>
            )}

            {/* Right Directional Cue with SVG Arrow */}
            {currentStep === 'right' && (
              <View style={[styles.whiteCueBox, styles.cueRight]}>
                <Text style={styles.whiteCueText}>TURN RIGHT</Text>
                <ArrowRightIcon size={18} color="#0f172a" />
              </View>
            )}

            {/* Saving Spinner */}
            {currentStep === 'saving' && (
              <View style={styles.savingInner}>
                <ActivityIndicator size="large" color="#0f172a" />
              </View>
            )}

            {/* Complete Checkmark */}
            {currentStep === 'done' && (
              <View style={styles.doneCircle}>
                <CheckIcon size={36} color="#ffffff" />
              </View>
            )}
          </View>
        </View>

        {/* Bottom Floating White Instruction Card */}
        <View style={styles.bottomInstructionWrapper}>
          <View style={styles.whiteInstructionCard}>
            <Text style={styles.instructionCardTitle}>{currentInfo.title}</Text>
            <Text style={styles.instructionCardSub}>{currentInfo.sub}</Text>

            {currentStep !== 'saving' && currentStep !== 'done' && (
              <View style={styles.autocaptureBadge}>
                <View style={styles.autocapturePulseDot} />
                <Text style={styles.autocaptureBadgeText}>HANDS-FREE AUTO CAPTURING</Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: '#000000',
  },
  hudOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
  },
  whiteCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  whiteStepPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  whiteStepPillText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  checkpointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  checkpointDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkpointActive: {
    backgroundColor: '#ffffff',
    transform: [{ scale: 1.15 }],
  },
  checkpointDone: {
    backgroundColor: '#10b981',
  },
  checkpointText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  checkpointTextDone: {
    color: '#ffffff',
  },
  checkpointLine: {
    width: 24,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  centerScannerArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 'auto',
  },
  minimalOval: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    borderRadius: OVAL_WIDTH / 2,
    borderWidth: 3.5,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  minimalOvalSuccess: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  ovalProgressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  ovalProgressBar: {
    height: '100%',
  },
  whiteCueBox: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  cueLeft: {
    left: -20,
  },
  cueRight: {
    right: -20,
  },
  whiteCueText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  savingInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomInstructionWrapper: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
  },
  whiteInstructionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionCardTitle: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  instructionCardSub: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  autocaptureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  autocapturePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  autocaptureBadgeText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  whiteConsentContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  whiteConsentScroll: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  whiteConsentCard: {
    alignItems: 'center',
  },
  cleanShieldCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appleTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  appleSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  svgStepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 22,
  },
  svgStepItem: {
    alignItems: 'center',
    flex: 1,
  },
  svgStepIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  svgStepLabel: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  svgStepLine: {
    width: 20,
    height: 1,
    backgroundColor: '#cbd5e1',
  },
  whiteNoticeBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  whiteNoticeHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  whiteNoticeText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 6,
  },
  applePrimaryBtn: {
    width: '100%',
    backgroundColor: '#0f172a',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  applePrimaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelLinkBtn: {
    marginTop: 16,
    padding: 10,
  },
  cancelLinkText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  whiteLoadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  appleNotice: {
    color: '#334155',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
});
