import requests
from backend.utils.logger import get_logger

logger = get_logger(__name__)

class POIService:
    OVERPASS_URL = "http://overpass-api.de/api/interpreter"

    @classmethod
    def get_pois_along_route(cls, route_geometry, origin=None, destination=None):
        pois = {
            "fuel_stations": [],
            "restaurants": [],
            "washrooms": [],
            "rest_areas": [],
            "charging_stations": []
        }
        
        # We need a bounding box or key points.
        # To avoid massive overpass queries on 1000km routes, we'll pick 3 key points:
        # Origin, Midpoint, Destination
        
        points_to_query = []
        if route_geometry and "coordinates" in route_geometry:
            coords = route_geometry["coordinates"]
            n = len(coords)
            if n > 0:
                points_to_query.append(coords[0]) # [lon, lat]
                if n > 2:
                    points_to_query.append(coords[n//2])
                points_to_query.append(coords[-1])
        elif origin and destination:
            points_to_query.append([origin["longitude"], origin["latitude"]])
            points_to_query.append([destination["longitude"], destination["latitude"]])
            
        if not points_to_query:
            return pois
            
        # For each point, find POIs within 5000 meters
        # We'll construct a combined Overpass QL query
        
        query_parts = []
        for lon, lat in points_to_query:
            radius = 5000 # meters
            # Fuel
            query_parts.append(f'node["amenity"="fuel"](around:{radius},{lat},{lon});')
            # Restaurants
            query_parts.append(f'node["amenity"="restaurant"](around:{radius},{lat},{lon});')
            # Washrooms
            query_parts.append(f'node["amenity"="toilets"](around:{radius},{lat},{lon});')
            # Rest areas
            query_parts.append(f'node["highway"="rest_area"](around:{radius},{lat},{lon});')
            # Charging
            query_parts.append(f'node["amenity"="charging_station"](around:{radius},{lat},{lon});')
            
        overpass_query = f"""
        [out:json][timeout:15];
        (
          {''.join(query_parts)}
        );
        out body;
        >;
        out skel qt;
        """
        
        try:
            response = requests.post(cls.OVERPASS_URL, data={'data': overpass_query}, headers={'User-Agent': 'RouteShield-App'}, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            for element in data.get("elements", []):
                if element["type"] == "node":
                    tags = element.get("tags", {})
                    poi = {
                        "id": element["id"],
                        "name": tags.get("name", "Unknown"),
                        "latitude": element["lat"],
                        "longitude": element["lon"],
                        "address": tags.get("addr:full", tags.get("addr:street", ""))
                    }
                    
                    if tags.get("amenity") == "fuel":
                        pois["fuel_stations"].append(poi)
                    elif tags.get("amenity") == "restaurant":
                        pois["restaurants"].append(poi)
                    elif tags.get("amenity") == "toilets":
                        pois["washrooms"].append(poi)
                    elif tags.get("highway") == "rest_area":
                        pois["rest_areas"].append(poi)
                    elif tags.get("amenity") == "charging_station":
                        pois["charging_stations"].append(poi)
                        
            # Limit results so payload doesn't explode
            for key in pois:
                pois[key] = pois[key][:20]
                
        except Exception as e:
            logger.error(f"Failed to fetch POIs from Overpass: {e}")
            
        return pois
