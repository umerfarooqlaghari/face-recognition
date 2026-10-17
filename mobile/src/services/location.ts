import * as Location from 'expo-location';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  isMocked: boolean;
}

export async function requestLocationPermissions(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentGPSLocation(): Promise<LocationCoordinates> {
  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) {
    throw new Error('Location permission is required for geofence attendance verification');
  }

  try {
    // Attempt high-accuracy GPS with a 10-second timeout promise
    const posPromise = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('GPS timeout')), 10000)
    );

    const location = await Promise.race([posPromise, timeoutPromise]);
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
      isMocked: location.mocked === true,
    };
  } catch {
    // Graceful fallback to last known position if device is indoors or satellite lock is slow
    const lastKnown = await Location.getLastKnownPositionAsync();
    if (lastKnown) {
      return {
        latitude: lastKnown.coords.latitude,
        longitude: lastKnown.coords.longitude,
        altitude: lastKnown.coords.altitude,
        accuracy: lastKnown.coords.accuracy,
        isMocked: lastKnown.mocked === true,
      };
    }
    throw new Error('Could not acquire GPS location. Please check location settings and retry.');
  }
}

