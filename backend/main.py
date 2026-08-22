from flask import Flask, request, jsonify
from flask_cors import CORS
from detector import MaskDetector
from config.db import insert_violation, violations_collection
import os

app = Flask(__name__)
CORS(app, resources={
    r"/predict": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    },
    r"/violations": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize detector
model_path = os.path.join("models", "mask_detector.weights.h5")
detector = MaskDetector(model_path)


@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    if not data or "image" not in data:
        return jsonify({"error": "No image data provided"}), 400

    camera_id = data.get("camera_id", "UNKNOWN_CAM")

    try:
        frame = detector.decode_image(data["image"])
        if frame is None:
            return jsonify({"error": "Invalid image data"}), 400

        results = detector.predict(frame)

        total = len(results)
        with_mask = sum(1 for r in results if "Aman" in r["label"])
        without_mask = sum(1 for r in results if "AWAS" in r["label"])

        for r in results:
            if "AWAS" in r["label"]:
                violation_id = insert_violation(
                    employee_id=None,
                    camera_id=camera_id,
                    confidence=r["confidence"],
                    match_score=None,
                    snapshot_base64=data["image"]
                )
                r["violation_id"] = violation_id

        return jsonify({
            "detections": results,
            "summary": {
                "total_faces": total,
                "with_mask": with_mask,
                "without_mask": without_mask,
                "status": "CLEAR" if without_mask == 0 else "VIOLATION"
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/violations", methods=["GET"])
def get_violations():
    """
    Return semua violation log, urut dari yang paling baru.
    Dipanggil FE (komponen Violations.jsx) buat nampilin log.
    """
    try:
        limit = int(request.args.get("limit", 100))

        cursor = violations_collection.find().sort("timestamp", -1).limit(limit)

        results = []
        for doc in cursor:
            results.append({
                "violation_id": str(doc["_id"]),
                "employee_id": doc.get("employee_id"),
                "camera_id": doc.get("camera_id"),
                "confidence": doc.get("confidence"),
                "match_score": doc.get("match_score"),
                "snapshot_base64": doc.get("snapshot_base64"),
                "timestamp": doc["timestamp"].isoformat() if doc.get("timestamp") else None,
                "notified": doc.get("notified", False),
            })

        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)