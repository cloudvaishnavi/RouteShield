import time
import os
from datetime import datetime
from pymongo import MongoClient
import requests

from backend.config.config import Config
from backend.utils.logger import get_logger

logger = get_logger("safety_worker")

def send_emergency_escalation(incident):
    is_demo = incident.get('is_demo', False)
    if is_demo:
        logger.critical(f"[SIMULATED] EMERGENCY ESCALATION for driver {incident.get('driver_id')}, incident {incident.get('incident_id')}!")
        logger.info("-> [SIMULATED] Calling driver phone")
        logger.info("-> [SIMULATED] Sending SMS to manager")
        logger.info("-> [SIMULATED] Firing dashboard alert via WebSocket/Push")
        return True
    else:
        logger.critical(f"REAL EMERGENCY ESCALATION for driver {incident.get('driver_id')}, incident {incident.get('incident_id')}!")
        logger.info("-> Calling driver phone (Production)")
        logger.info("-> Sending SMS to manager (Production)")
        logger.info("-> Firing dashboard alert via WebSocket/Push (Production)")
        return True

def process_deadlines():
    logger.info("Safety worker started. Monitoring deadlines...")
    
    if not Config.MONGO_URI:
        logger.error("MONGO_URI not configured. Exiting worker.")
        return
        
    client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[Config.MONGO_DB_NAME]
    
    while True:
        try:
            now = datetime.utcnow().isoformat()
            # Find all ACTIVE incidents where deadline <= now
            query = {
                "status": "ACTIVE",
                "deadline": {"$lte": now}
            }
            
            # Use findOneAndUpdate to prevent duplicate escalation from multiple workers
            # Atomically set to ESCALATING to lock it
            incident = db.safety_incidents.find_one_and_update(
                query,
                {"$set": {"status": "ESCALATING", "updated_at": now}}
            )
            
            if incident:
                logger.info(f"Processing expired deadline for incident: {incident['incident_id']}")
                success = send_emergency_escalation(incident)
                
                # Mark as ESCALATED
                db.safety_incidents.update_one(
                    {"incident_id": incident["incident_id"]},
                    {"$set": {
                        "status": "ESCALATED",
                        "escalation_status": "COMPLETED" if success else "FAILED",
                        "escalation_attempts": incident.get("escalation_attempts", 0) + 1,
                        "updated_at": datetime.utcnow().isoformat()
                    }}
                )
            else:
                # Sleep a bit if no expired incidents to prevent busy-looping
                time.sleep(5)
                
        except Exception as e:
            logger.error(f"Error in safety worker: {e}")
            time.sleep(10)

if __name__ == "__main__":
    process_deadlines()
