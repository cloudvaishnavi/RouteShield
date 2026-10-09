import math
from datetime import datetime, timedelta
import uuid
from pymongo import MongoClient, ReturnDocument
from backend.config.config import Config
from backend.utils.logger import get_logger

logger = get_logger(__name__)

class SafetyService:
    _client = None
    _db = None

    @classmethod
    def get_db(cls):
        if cls._client is None:
            if not Config.MONGO_URI:
                raise ValueError("MONGO_URI is missing")
            cls._client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
            cls._db = cls._client[Config.MONGO_DB_NAME]
            # Ensure indexes
            cls._db.safety_incidents.create_index("driver_id")
            cls._db.safety_incidents.create_index("status")
            cls._db.safety_incidents.create_index("deadline")
        return cls._db

    @staticmethod
    def haversine_distance(lat1, lon1, lat2, lon2):
        R = 6371000 # Earth radius in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    @classmethod
    def get_zones(cls):
        db = cls.get_db()
        return list(db.risk_zones.find({}, {"_id": 0}))

    @classmethod
    def upsert_zone(cls, zone_id, name, lat, lng, radius_meters, risk_level, enabled=True):
        db = cls.get_db()
        if not zone_id:
            zone_id = str(uuid.uuid4())
        doc = {
            "zone_id": zone_id,
            "name": name,
            "latitude": float(lat),
            "longitude": float(lng),
            "radius_meters": float(radius_meters),
            "risk_level": risk_level,
            "enabled": enabled,
            "updated_at": datetime.utcnow().isoformat()
        }
        db.risk_zones.update_one({"zone_id": zone_id}, {"$set": doc}, upsert=True)
        return doc

    @classmethod
    def delete_zone(cls, zone_id):
        db = cls.get_db()
        return db.risk_zones.delete_one({"zone_id": zone_id}).deleted_count > 0

    @classmethod
    def detect_zone(cls, lat, lng):
        zones = cls.get_zones()
        for z in zones:
            if not z.get("enabled", True):
                continue
            dist = cls.haversine_distance(float(lat), float(lng), z["latitude"], z["longitude"])
            if dist <= z.get("radius_meters", 1000):
                return z
        return None

    @classmethod
    def update_location(cls, driver_id, lat, lng, is_demo=False, accelerated=False):
        db = cls.get_db()
        now = datetime.utcnow()
        active_zone = cls.detect_zone(lat, lng)
        
        # Check for active incident for this driver
        incident = db.safety_incidents.find_one({"driver_id": driver_id, "status": "ACTIVE"})

        if incident:
            updates = {
                "last_location": {"latitude": lat, "longitude": lng},
                "last_location_time": now.isoformat(),
                "updated_at": now.isoformat()
            }
            
            if active_zone and active_zone["zone_id"] == incident["zone_id"]:
                # Still inside or re-entered the SAME zone -> invalidate any previous exit
                if incident.get("exit_time"):
                    updates["exit_time"] = None
            elif not active_zone:
                # Driver is outside the zone -> record exit_time if not already set
                if not incident.get("exit_time"):
                    updates["exit_time"] = now.isoformat()
            
            updated_doc = db.safety_incidents.find_one_and_update(
                {"incident_id": incident["incident_id"]},
                {"$set": updates},
                return_document=ReturnDocument.AFTER
            )
            updated_doc.pop("_id", None)
            return updated_doc
        
        else:
            # No active incident. Did they just enter a zone?
            if active_zone:
                incident_id = str(uuid.uuid4())
                minutes = 1 if (is_demo and accelerated) else 20
                deadline = now + timedelta(minutes=minutes)
                doc = {
                    "incident_id": incident_id,
                    "driver_id": driver_id,
                    "zone_id": active_zone["zone_id"],
                    "risk_level": active_zone["risk_level"],
                    "entry_coords": {"latitude": lat, "longitude": lng},
                    "entry_time": now.isoformat(),
                    "deadline": deadline.isoformat(),
                    "status": "ACTIVE",  # ACTIVE, RESOLVED, ESCALATED
                    "last_location": {"latitude": lat, "longitude": lng},
                    "last_location_time": now.isoformat(),
                    "exit_time": None,
                    "confirmation_time": None,
                    "escalation_status": "NONE",
                    "escalation_attempts": 0,
                    "is_demo": is_demo,
                    "created_at": now.isoformat(),
                    "updated_at": now.isoformat()
                }
                db.safety_incidents.insert_one(doc)
                doc.pop("_id", None)
                return doc
                
        return None

    @classmethod
    def confirm_safety(cls, driver_id, incident_id):
        db = cls.get_db()
        now = datetime.utcnow()
        
        incident = db.safety_incidents.find_one({"incident_id": incident_id, "driver_id": driver_id})
        if not incident:
            return {"success": False, "error": "Incident not found."}
            
        if incident["status"] != "ACTIVE":
            return {"success": False, "error": f"Incident is {incident['status']}, cannot resolve."}
            
        if not incident.get("exit_time"):
            return {"success": False, "error": "Cannot confirm safety while still inside the high-risk zone."}
            
        # Resolve incident
        updates = {
            "status": "RESOLVED",
            "confirmation_time": now.isoformat(),
            "updated_at": now.isoformat()
        }
        updated = db.safety_incidents.find_one_and_update(
            {"incident_id": incident_id},
            {"$set": updates},
            return_document=ReturnDocument.AFTER
        )
        updated.pop("_id", None)
        return {"success": True, "incident": updated}

    @classmethod
    def get_driver_status(cls, driver_id):
        db = cls.get_db()
        incident = db.safety_incidents.find_one(
            {"driver_id": driver_id, "status": {"$in": ["ACTIVE", "ESCALATED"]}}, 
            sort=[("created_at", -1)]
        )
        if incident:
            incident.pop("_id", None)
        return incident
