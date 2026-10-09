import os
import requests
import math
from backend.utils.logger import get_logger
import urllib.parse

logger = get_logger(__name__)

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def geocode_nominatim(query):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": query,
        "format": "json",
        "limit": 1
    }
    headers = {
        "User-Agent": "RouteShield-App"
    }
    try:
        response = requests.get(url, params=params, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()
        if data and len(data) > 0:
            return {
                "name": data[0].get("display_name", query),
                "latitude": float(data[0]["lat"]),
                "longitude": float(data[0]["lon"])
            }
        return None
    except Exception as e:
        logger.error(f"Nominatim geocode failed for {query}: {e}")
        return None

def calculate_route_osrm(origin_coords, dest_coords):
    url = f"http://router.project-osrm.org/route/v1/driving/{origin_coords['longitude']},{origin_coords['latitude']};{dest_coords['longitude']},{dest_coords['latitude']}"
    params = {
        "overview": "full",
        "geometries": "geojson"
    }
    try:
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()
        if data.get("code") == "Ok" and data.get("routes"):
            route = data["routes"][0]
            return {
                "distance_km": round(route["distance"] / 1000.0, 1),
                "duration_minutes": round(route["duration"] / 60.0, 1),
                "geometry": route.get("geometry")
            }
        return None
    except Exception as e:
        logger.error(f"OSRM routing failed: {e}")
        return None

def resolve_and_calculate_route(origin_query, destination_query):
    # Geocoding
    origin_data = geocode_nominatim(origin_query)
    dest_data = geocode_nominatim(destination_query)
    
    if not origin_data:
        return {"success": False, "error": f"Could not resolve origin: {origin_query}"}
    if not dest_data:
        return {"success": False, "error": f"Could not resolve destination: {destination_query}"}
        
    # Routing
    route_data = calculate_route_osrm(origin_data, dest_data)
    
    route_geometry = None
    if route_data:
        distance = route_data["distance_km"]
        duration = route_data["duration_minutes"]
        route_geometry = route_data.get("geometry")
    else:
        # Fallback to geodesic distance if no driving route
        distance = round(haversine_distance(
            origin_data["latitude"], origin_data["longitude"],
            dest_data["latitude"], dest_data["longitude"]
        ), 1)
        duration = None

    google_maps_url = f"https://www.google.com/maps/dir/?api=1&origin={urllib.parse.quote(origin_query)}&destination={urllib.parse.quote(destination_query)}"
    
    return {
        "success": True,
        "origin": {
            "query": origin_query,
            "name": origin_data["name"],
            "latitude": origin_data["latitude"],
            "longitude": origin_data["longitude"]
        },
        "destination": {
            "query": destination_query,
            "name": dest_data["name"],
            "latitude": dest_data["latitude"],
            "longitude": dest_data["longitude"]
        },
        "distance_km": distance,
        "duration_minutes": duration,
        "route_geometry": route_geometry,
        "google_maps_url": google_maps_url
    }
