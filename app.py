import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras # Tambahin ini
import winsound
import threading

# ========== LOAD MODEL DENGAN CUSTOM OBJECTS ==========
# Keras butuh dikasih tahu kalau 'preprocess_input' itu fungsi MobileNetV2
custom_objects = {
    'preprocess_input': keras.applications.mobilenet_v2.preprocess_input
}

try:
    model = tf.keras.models.load_model("mask_detector_demo.keras", custom_objects=custom_objects)
    print("Model berhasil di-load!")
except Exception as e:
    print(f"Gagal load model: {e}")
    exit()

# Load Haar Cascade untuk deteksi wajah (Bawaan OpenCV)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Label kelas
# Pastikan ini sesuai hasil training lu (biasanya Alfabet: 0=Mask, 1=No Mask)
LABELS = {
    0: "Aman: Pakai Masker",       # balik lagi
    1: "AWAS: GAK PAKE MASKER!"    # balik lagi
}

# Fungsi buat play suara di background
def play_alert():
    winsound.Beep(1000, 500)

# ========== BUKA WEBCAM ==========
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        print("Gagal akses webcam!")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))

    for (x, y, w, h) in faces:
        face_roi = frame[y:y+h, x:x+w]
        face_roi = face_roi[int(h*0.2):, :]
        face_resized = cv2.resize(face_roi, (160, 160))
        face_array = np.expand_dims(face_resized, axis=0)
        
        face_array = tf.keras.applications.mobilenet_v2.preprocess_input(face_array.astype(np.float32)) 

        # Prediksi
        predictions = model.predict(face_array, verbose=0)
        print(f"WithMask: {predictions[0][0]:.4f} | WithoutMask: {predictions[0][1]:.4f}")
        print(f"Raw predictions: {predictions}")  # tambahin ini
        print(f"class_names dari training: WithMask=0, WithoutMask=1")
        class_index = np.argmax(predictions)
        confidence = np.max(predictions)

        # Logika Warna & Alert
        if class_index == 0: 
            color = (0, 255, 0) # Hijau
            text = f"{LABELS[0]} ({confidence*100:.1f}%)"
        else:
            color = (0, 0, 255) # Merah
            text = f"{LABELS[1]} ({confidence*100:.1f}%)"
            
            if threading.active_count() < 2:
                threading.Thread(target=play_alert, daemon=True).start()

        cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
        cv2.putText(frame, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    cv2.imshow("Mask Detector Live", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
