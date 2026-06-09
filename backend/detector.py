import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import mediapipe as mp
import base64

class MaskDetector:
    def __init__(self, model_path):
        try:
            IMG_SIZE = (224, 224, 3) 
            
            base_model = keras.applications.MobileNetV2(
                input_shape=IMG_SIZE,
                include_top=False,
                weights=None  
            )
            base_model.trainable = False
            

            self.model = keras.Sequential([
                keras.Input(shape=IMG_SIZE),
                
                base_model,
                layers.GlobalAveragePooling2D(),
                layers.Dropout(0.5), 
                layers.Dense(128, activation='relu'),
                layers.Dense(2, activation='softmax')
            ])
            self.model.load_weights(model_path)
            print("Model loaded successfully with 224x224 shape!")
        except Exception as e:
            print(f"Gagal rakit model: {e}")
            raise e

        # MediaPipe Setup
        self.mp_face = mp.solutions.face_detection
        self.face_detector = self.mp_face.FaceDetection(
            model_selection=0,       
            min_detection_confidence=0.6
        )
        self.labels = {0: "Aman: Pakai Masker", 1: "AWAS: GAK PAKE MASKER!"}

    def decode_image(self, base64_string):
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    def predict(self, frame):
        h_img, w_img = frame.shape[:2]

        # MediaPipe butuh RGB
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        detection_result = self.face_detector.process(rgb)

        results = []
        if not detection_result.detections:
            return results  

        for detection in detection_result.detections:
            bbox = detection.location_data.relative_bounding_box
            
            w = int(bbox.width * w_img)
            h = int(bbox.height * h_img)
            x = int(bbox.xmin * w_img)
            y = int(bbox.ymin * h_img)

            center_x = int((bbox.xmin + bbox.width / 2) * w_img)
            center_y = int((bbox.ymin + bbox.height / 2) * h_img)
            
            max_side = max(w, h)
            padding = int(max_side * 0.2)
            half_side = (max_side + padding) // 2
            
            x_start = max(0, center_x - half_side)
            y_start = max(0, center_y - half_side)
            x_end = min(w_img, center_x + half_side)
            y_end = min(h_img, center_y + half_side)
            
            face_roi = frame[y_start:y_end, x_start:x_end]
            if face_roi.size == 0:
                continue

            # 2. PERBAIKAN: Resize ke 224 sesuai model baru Anda
            face_resized = cv2.resize(face_roi, (224, 224))
            face_rgb = cv2.cvtColor(face_resized, cv2.COLOR_BGR2RGB)
            
            face_array = np.expand_dims(face_rgb, axis=0).astype(np.float32)
            face_array = keras.applications.mobilenet_v2.preprocess_input(face_array)

            CONFIDENCE_THRESHOLD = 0.85

            predictions = self.model.predict(face_array, verbose=0)
            confidence = float(np.max(predictions))

            if confidence < CONFIDENCE_THRESHOLD:
                results.append({
                    "bbox": [x, y, w, h],
                    "label": "Tidak Terdeteksi",
                    "confidence": confidence
                })
                continue

            class_index = int(np.argmax(predictions))
            results.append({
                "bbox": [x, y, w, h],
                "label": self.labels[class_index],
                "confidence": confidence
            })

        return results
