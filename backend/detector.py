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
            base_model = keras.applications.MobileNetV2(
                input_shape=(160, 160, 3),
                include_top=False,
                weights=None
            )
            base_model.trainable = False
            self.model = keras.Sequential([
                keras.Input(shape=(160, 160, 3)),
                base_model,
                layers.GlobalAveragePooling2D(),
                layers.Dropout(0.3),
                layers.Dense(128, activation='relu'),
                layers.Dense(2, activation='softmax')
            ])
            self.model.load_weights(model_path)
            print("Model loaded successfully!")
        except Exception as e:
            print(f"Gagal rakit model: {e}")
            raise e

        # Ganti Haar Cascade ke MediaPipe
        self.mp_face = mp.solutions.face_detection
        self.face_detector = self.mp_face.FaceDetection(
            model_selection=0,       # 0 = short range (< 2m), cocok buat webcam
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
            return results  # nggak ada wajah

        for detection in detection_result.detections:
            bbox = detection.location_data.relative_bounding_box

            # Konversi relative koordinat → pixel
            x = int(bbox.xmin * w_img)
            y = int(bbox.ymin * h_img)
            w = int(bbox.width  * w_img)
            h = int(bbox.height * h_img)

            # Clamp biar nggak keluar frame
            x = max(0, x)
            y = max(0, y)
            w = min(w, w_img - x)
            h = min(h, h_img - y)

            # Crop 20% area atas (dahi/rambut)
            y_crop = y + int(h * 0.2)
            face_roi = frame[y_crop:y+h, x:x+w]
            if face_roi.size == 0:
                continue

            face_resized = cv2.resize(face_roi, (160, 160))
            face_rgb = cv2.cvtColor(face_resized, cv2.COLOR_BGR2RGB)
            face_array = np.expand_dims(face_rgb, axis=0).astype(np.float32)
            face_array = tf.keras.applications.mobilenet_v2.preprocess_input(face_array)

            predictions = self.model.predict(face_array, verbose=0)
            class_index = int(np.argmax(predictions))

            results.append({
                "bbox": [x, y, w, h],
                "label": self.labels[class_index],
                "confidence": float(np.max(predictions))
            })

        return results