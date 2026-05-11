import cv2
import numpy as np
import tensorflow as tf
import winsound
import threading

# ========== LOAD MODEL ==========
# Pastikan nama file sesuai dengan yang lu save sebelumnya
model = tf.keras.models.load_model("mask_detector.keras")

# Load Haar Cascade untuk deteksi wajah (Bawaan OpenCV)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Label kelas (0 dan 1)
# NOTE: Cek urutan array class_names lu pas training. 
# Secara alfabet, 'with_mask' biasanya index 0, 'without_mask' index 1.
# Kalau kebalik, tinggal tukar aja teks di bawah ini.
LABELS = {
    0: "Aman: Pakai Masker", 
    1: "AWAS: GAK PAKE MASKER!"
}

# Fungsi buat play suara di background
def play_alert():
    # Frekuensi 1000Hz, durasi 500ms
    winsound.Beep(1000, 500)

# ========== BUKA WEBCAM ==========
cap = cv2.VideoCapture(0) # 0 adalah ID default webcam laptop

while True:
    ret, frame = cap.read()
    if not ret:
        print("Gagal akses webcam!")
        break

    # Convert frame ke grayscale (Haar Cascade butuh gambar hitam putih buat deteksi wajah)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Deteksi letak wajah di layar
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))

    for (x, y, w, h) in faces:
        # Crop area wajah aja dari frame yang BERWARNA (karena model lu butuh RGB)
        face_roi = frame[y:y+h, x:x+w]

        # Preprocessing: Resize ke 128x128 sesuai input model lu
        face_resized = cv2.resize(face_roi, (160, 160))
        
        # Expand dimensi jadi (1, 128, 128, 3) biar dianggap sebagai 1 batch oleh model
        face_array = np.expand_dims(face_resized, axis=0) 
        
        # Lu gak perlu manual face_array / 255.0 lagi karena di model.py lu 
        # udah ada `layers.Rescaling(1./255)`

        # Prediksi
        predictions = model.predict(face_array, verbose=0)
        class_index = np.argmax(predictions)
        confidence = np.max(predictions)

        # ========== LOGIKA WARNA & ALERT ==========
        if class_index == 0: # Asumsi 0 = with_mask
            color = (0, 255, 0) # Format OpenCV itu BGR, jadi ini (Blue=0, Green=255, Red=0)
            text = f"{LABELS[0]} ({confidence*100:.1f}%)"
        else:
            color = (0, 0, 255) # Merah
            text = f"{LABELS[1]} ({confidence*100:.1f}%)"
            
            # Panggil alarm pake threading biar video gak nungguin bunyi selesai
            if threading.active_count() < 2: # Mencegah suara tumpang tindih spamming
                threading.Thread(target=play_alert, daemon=True).start()

        # Gambar kotak di wajah
        cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
        
        # Tulis teks di atas kotak
        cv2.putText(frame, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    # Tampilkan ke layar
    cv2.imshow("Mask Detector Live", frame)

    # Tekan tombol 'q' di keyboard buat stop
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Bersihkan RAM & tutup kamera setelah selesai
cap.release()
cv2.destroyAllWindows()