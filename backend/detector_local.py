import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
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

        # OpenCV DNN — no mediapipe needed
        self.face_net = cv2.dnn.readNetFromCaffe(
            cv2.data.haarcascades + "../dnn/deploy.prototxt",
            cv2.data.haarcascades + "../dnn/res10_300x300_ssd_iter_140000.caffemodel"
        )
        self.labels = {0: "Aman: Pakai Masker", 1: "AWAS: GAK PAKE MASKER!"}

    def decode_image(self, base64_string):
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        img_data = base64.b64decode(base64_string)
        nparr    = np.frombuffer(img_data, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    def predict(self, frame):
        h, w = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(
            cv2.resize(frame, (300, 300)),
            1.0, (300, 300), (104.0, 177.0, 123.0)
        )
        self.face_net.setInput(blob)
        detections = self.face_net.forward()

        results = []
        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            if confidence < 0.6:
                continue

            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            x1, y1, x2, y2 = box.astype("int")
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)

            face_roi = frame[y1+int((y2-y1)*0.2):y2, x1:x2]
            if face_roi.size == 0:
                continue

            face_resized = cv2.resize(face_roi, (160, 160))
            face_rgb     = cv2.cvtColor(face_resized, cv2.COLOR_BGR2RGB)
            face_array   = np.expand_dims(face_rgb, axis=0).astype(np.float32)
            face_array   = tf.keras.applications.mobilenet_v2.preprocess_input(face_array)

            preds        = self.model.predict(face_array, verbose=0)
            class_index  = int(np.argmax(preds))

            results.append({
                "bbox":       [int(x1), int(y1), int(x2-x1), int(y2-y1)],
                "label":      self.labels[class_index],
                "confidence": float(np.max(preds))
            })

        return results