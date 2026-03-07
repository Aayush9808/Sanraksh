"""
Geo Utilities
Helper functions for geographic calculations
"""

import math
from typing import Tuple, List, Dict


def calculate_distance(
    lat1: float,
    lng1: float,
    lat2: float,
    lng2: float
) -> float:
    """
    Calculate distance between two points using Haversine formula
    
    Args:
        lat1, lng1: First point coordinates
        lat2, lng2: Second point coordinates
    
    Returns:
        Distance in kilometers
    """
    R = 6371  # Earth's radius in km
    
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    
    # Haversine formula
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) *
         math.sin(dlng / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return round(distance, 2)


def get_zone_id(lat: float, lng: float, grid_size_km: float = 2.0) -> str:
    """
    Get zone ID for hyper-local mapping (2km x 2km grids)
    
    Args:
        lat, lng: Coordinates
        grid_size_km: Grid size in km (default 2km)
    
    Returns:
        Zone ID string
    """
    # Convert km to approximate degrees
    # 1 degree lat ≈ 111km, 1 degree lng ≈ 111km * cos(lat)
    lat_per_km = 1 / 111
    lng_per_km = 1 / (111 * math.cos(math.radians(lat)))
    
    # Calculate grid coordinates
    grid_lat = int(lat / (grid_size_km * lat_per_km))
    grid_lng = int(lng / (grid_size_km * lng_per_km))
    
    return f"ZONE_{grid_lat}_{grid_lng}"


def get_zone_center(zone_id: str, grid_size_km: float = 2.0) -> Tuple[float, float]:
    """
    Get center coordinates of a zone
    
    Args:
        zone_id: Zone identifier
        grid_size_km: Grid size in km
    
    Returns:
        (lat, lng) tuple
    """
    try:
        parts = zone_id.split("_")
        grid_lat = int(parts[1])
        grid_lng = int(parts[2])
        
        lat_per_km = 1 / 111
        lng_per_km = 1 / 111
        
        # Calculate center
        center_lat = (grid_lat + 0.5) * (grid_size_km * lat_per_km)
        center_lng = (grid_lng + 0.5) * (grid_size_km * lng_per_km)
        
        return (round(center_lat, 6), round(center_lng, 6))
    except:
        return (0.0, 0.0)


def get_zones_in_radius(
    center_lat: float,
    center_lng: float,
    radius_km: float = 5.0,
    grid_size_km: float = 2.0
) -> List[str]:
    """
    Get all zone IDs within radius
    
    Args:
        center_lat, center_lng: Center point
        radius_km: Radius to search
        grid_size_km: Grid size
    
    Returns:
        List of zone IDs
    """
    zones = []
    
    # Number of grids to check in each direction
    num_grids = int(math.ceil(radius_km / grid_size_km)) + 1
    
    center_zone = get_zone_id(center_lat, center_lng, grid_size_km)
    zones.append(center_zone)
    
    # Get neighboring zones
    try:
        parts = center_zone.split("_")
        base_grid_lat = int(parts[1])
        base_grid_lng = int(parts[2])
        
        for dlat in range(-num_grids, num_grids + 1):
            for dlng in range(-num_grids, num_grids + 1):
                if dlat == 0 and dlng == 0:
                    continue
                
                zone_id = f"ZONE_{base_grid_lat + dlat}_{base_grid_lng + dlng}"
                zone_center = get_zone_center(zone_id, grid_size_km)
                
                distance = calculate_distance(
                    center_lat, center_lng,
                    zone_center[0], zone_center[1]
                )
                
                if distance <= radius_km:
                    zones.append(zone_id)
    except:
        pass
    
    return zones


def is_point_in_radius(
    point_lat: float,
    point_lng: float,
    center_lat: float,
    center_lng: float,
    radius_km: float
) -> bool:
    """
    Check if point is within radius of center
    
    Returns:
        True if point is within radius
    """
    distance = calculate_distance(point_lat, point_lng, center_lat, center_lng)
    return distance <= radius_km


def get_city_from_coordinates(lat: float, lng: float) -> str:
    """
    Get city name from coordinates (would use reverse geocoding API)
    
    For now, returns based on approximate Indian cities
    """
    # This would integrate with Google Maps Geocoding API
    # Simplified version for major Indian cities
    
    cities = {
        (19.0760, 72.8777): "Mumbai",
        (12.9716, 77.5946): "Bangalore",
        (28.7041, 77.1025): "Delhi",
        (17.3850, 78.4867): "Hyderabad",
        (13.0827, 80.2707): "Chennai",
        (22.5726, 88.3639): "Kolkata",
        (23.0225, 72.5714): "Ahmedabad",
        (18.5204, 73.8567): "Pune",
    }
    
    # Find closest city
    min_distance = float('inf')
    closest_city = "Unknown"
    
    for (city_lat, city_lng), city_name in cities.items():
        distance = calculate_distance(lat, lng, city_lat, city_lng)
        if distance < min_distance:
            min_distance = distance
            closest_city = city_name
    
    return closest_city if min_distance < 50 else "Unknown"


def generate_heatmap_grid(
    city_bounds: Dict,
    grid_size_km: float = 2.0
) -> List[Dict]:
    """
    Generate grid cells for heatmap visualization
    
    Args:
        city_bounds: {min_lat, max_lat, min_lng, max_lng}
        grid_size_km: Grid size
    
    Returns:
        List of grid cells with coordinates
    """
    cells = []
    
    lat_per_km = 1 / 111
    lng_per_km = 1 / 111
    
    current_lat = city_bounds["min_lat"]
    while current_lat < city_bounds["max_lat"]:
        current_lng = city_bounds["min_lng"]
        while current_lng < city_bounds["max_lng"]:
            zone_id = get_zone_id(current_lat, current_lng, grid_size_km)
            
            cells.append({
                "zone_id": zone_id,
                "center_lat": round(current_lat + grid_size_km * lat_per_km / 2, 6),
                "center_lng": round(current_lng + grid_size_km * lng_per_km / 2, 6),
                "bounds": {
                    "min_lat": round(current_lat, 6),
                    "max_lat": round(current_lat + grid_size_km * lat_per_km, 6),
                    "min_lng": round(current_lng, 6),
                    "max_lng": round(current_lng + grid_size_km * lng_per_km, 6),
                }
            })
            
            current_lng += grid_size_km * lng_per_km
        current_lat += grid_size_km * lat_per_km
    
    return cells
