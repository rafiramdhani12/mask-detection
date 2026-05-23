from flask import Flask, request, jsonify
from flask_cors import CORS
from detector import MaskDetector
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize detector
model_path = os.path.join("models", "mask_detector.weights.h5")
detector = MaskDetector(model_path)

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
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)