import math
from typing import Tuple

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two GPS coordinates in meters
    using the Haversine formula.
    """
    # Radius of the Earth in meters
    R = 6371000.0

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2 +
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = R * c
    return round(distance, 2)

def is_within_geofence(
    user_lat: float,
    user_lon: float,
    office_lat: float,
    office_lon: float,
    radius_meters: int = 200
) -> Tuple[bool, float]:
    """
    Checks if a user's coordinates fall within the specified office radius.
    Returns: (is_within_radius, distance_in_meters)
    """
    distance = calculate_haversine_distance(user_lat, user_lon, office_lat, office_lon)
    return distance <= radius_meters, distance
