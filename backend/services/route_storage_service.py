from pymongo import MongoClient
from backend.config.config import Config
from datetime import datetime
import uuid

class RouteStorageService:
    _client = None
    _db = None

    @classmethod
    def get_db(cls):
        if cls._client is None:
            if not Config.MONGO_URI:
                raise ValueError("Database configuration error: MONGO_URI is missing in .env file. Please check backend/.env.example for setup instructions.")
            cls._client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
            cls._db = cls._client[Config.MONGO_DB_NAME]
        return cls._db

    @classmethod
    def save_route(cls, route_data):
        db = cls.get_db()
        route_id = str(uuid.uuid4())
        
        doc = {
            "route_id": route_id,
            "origin": route_data.get("origin", {}),
            "destination": route_data.get("destination", {}),
            "distance_km": route_data.get("distance_km"),
            "duration_minutes": route_data.get("duration_minutes"),
            "route_geometry": route_data.get("route_geometry", {}),
            "google_maps_url": route_data.get("google_maps_url", ""),
            "route_summary": route_data.get("route_summary", ""),
            "risk": route_data.get("risk", {}),
            "recommendation": route_data.get("recommendation", {}),
            "pois": route_data.get("pois", {}),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "offline_package_version": 1
        }
        
        db.saved_routes.insert_one(doc)
        del doc["_id"]
        return doc

    @classmethod
    def get_all_routes(cls):
        db = cls.get_db()
        routes = list(db.saved_routes.find({}, {"_id": 0}).sort("created_at", -1))
        return routes

    @classmethod
    def get_route(cls, route_id):
        db = cls.get_db()
        route = db.saved_routes.find_one({"route_id": route_id}, {"_id": 0})
        return route

    @classmethod
    def delete_route(cls, route_id):
        db = cls.get_db()
        result = db.saved_routes.delete_one({"route_id": route_id})
        return result.deleted_count > 0
