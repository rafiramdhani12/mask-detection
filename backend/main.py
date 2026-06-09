from flask import Flask, request, jsonify
from flask_cors import CORS
from detector import MaskDetector
import os

app = Flask(__name__)
CORS(app, resources={
    r"/predict": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})
# Initialize detector
model_path = os.path.join("models", "mask_detector.weights.h5")
detector = MaskDetector(model_path)

# Di app.py, ubah route predict
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    if not data or "image" not in data:
        return jsonify({"error": "No image data provided"}), 400
    
    try:
        frame = detector.decode_image(data["image"])
        if frame is None:
            return jsonify({"error": "Invalid image data"}), 400
            
        results = detector.predict(frame)

        # Tambahin summary
        total = len(results)
        with_mask = sum(1 for r in results if "Aman" in r["label"])
        without_mask = sum(1 for r in results if "AWAS" in r["label"])

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


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)