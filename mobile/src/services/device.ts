import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { DeviceTelemetry } from '../types';

const DEVICE_UUID_KEY = 'attend_device_uuid_v1';

export async function getOrCreateDeviceId(): Promise<string> {
  try {
    let deviceId = await SecureStore.getItemAsync(DEVICE_UUID_KEY);
    if (!deviceId) {
      if (Platform.OS === 'android') {
        deviceId = Application.getAndroidId() || `android-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      } else if (Platform.OS === 'ios') {
        deviceId = (await Application.getIosIdForVendorAsync()) || `ios-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      } else {
        deviceId = `web-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      }
      await SecureStore.setItemAsync(DEVICE_UUID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return `fallback-${Platform.OS}-${Date.now()}`;
  }
}

export async function getDeviceTelemetry(): Promise<DeviceTelemetry> {
  const deviceId = await getOrCreateDeviceId();
  return {
    device_id: deviceId,
    device_model: Device.modelName || (Platform.OS === 'ios' ? 'Apple Device' : 'Android Device'),
    os_name: Device.osName || Platform.OS,
    os_version: Device.osVersion || 'Unknown',
    app_version: Application.nativeApplicationVersion || '1.0.0',
  };
}
