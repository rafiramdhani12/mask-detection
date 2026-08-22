from pymongo import MongoClient,ASCENDING
from datetime import datetime, timezone

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "mask-detection"

try:
    client = MongoClient(MONGO_URI , serverSelectionTimeoutMS=5000)
    client.server_info()
    db = client[DB_NAME]
    print(f"Connected to MongoDB {DB_NAME} on {MONGO_URI}")
except Exception as e:
    print(f"[MongoDB] Gagal konek ke MongoDB: {e}")
    print("[MongoDB] Pastiin mongod udah jalan (mongod / systemctl start mongod)")
    raise e

violations_collection = db['violations']

def setup_indexes():
    violations_collection.create_index([('camera_id', ASCENDING), ('timestamp', ASCENDING)])
    print('[DB] Indexes created')

def insert_violation(employee_id, camera_id, confidence, match_score, snapshot_base64=None):
    doc = {
        "employee_id": employee_id,  # None kalau unknown person
        "camera_id": camera_id,
        "confidence": confidence,
        "match_score": match_score,
        "snapshot_base64": snapshot_base64,
        "timestamp": datetime.now(timezone.utc),
        "notified": False,
    }
    result = violations_collection.insert_one(doc)
    return str(result.inserted_id)
 
 
if __name__ == "__main__":
    # jalanin langsung file ini buat setup index pertama kali: python db.py
    setup_indexes()
 
