import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
import base64

class MaskDetector:
    def __init__(self, model_path):
        # Custom objects for MobileNetV2 preprocessing if needed
        custom_objects = {
            'preprocess_input': keras.applications.mobilenet_v2.preprocess_input
        }
        
        try:
            self.model = tf.keras.models.load_model(model_path, custom_objects=custom_objects)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise e

        # Load Haar Cascade
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        self.labels = {
            0: "Aman: Pakai Masker",
            1: "AWAS: GAK PAKE MASKER!"
        }

    def decode_image(self, base64_string):
        # Remove metadata header if present
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img

    def predict(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))
        
        results = []
        for (x, y, w, h) in faces:
            # Preprocessing matching the original app.py/training.py
            face_roi = frame[y:y+h, x:x+w]
            # Crop top 20% to avoid hair/forehead issues as per original app.py
            face_roi = face_roi[int(h*0.2):, :]
            
            face_resized = cv2.resize(face_roi, (160, 160))
            face_array = np.expand_dims(face_resized, axis=0)
            
            # Note: training.py uses Rescaling(1./255) layer. 
            # app.py uses mobilenet_v2.preprocess_input.
            # We'll stick to the model's internal layers if possible or match app.py logic.
            # Based on app.py:
            face_array = tf.keras.applications.mobilenet_v2.preprocess_input(face_array.astype(np.float32))

            predictions = self.model.predict(face_array, verbose=0)
            class_index = int(np.argmax(predictions))
            confidence = float(np.max(predictions))

            results.append({
                "bbox": [int(x), int(y), int(w), int(h)],
                "label": self.labels[class_index],
                "class_index": class_index,
                "confidence": confidence
            })
            
        return results
