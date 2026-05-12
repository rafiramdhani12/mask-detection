# 😷 Real-Time Face Mask Detector with TensorFlow & OpenCV

> Sistem deteksi masker wajah real-time menggunakan Deep Learning, OpenCV, dan webcam.  
> Ketika seseorang terdeteksi tidak memakai masker, sistem akan memberikan **peringatan visual + alarm suara otomatis**.

---

## 📸 Preview

| Dengan Masker | Tanpa Masker |
|---|---|
| 🟩 Kotak Hijau | 🟥 Kotak Merah + Alarm |

---

# 🚀 Features

✅ Real-time face detection menggunakan webcam  
✅ Deteksi penggunaan masker dengan CNN TensorFlow  
✅ Alarm otomatis jika tidak memakai masker  
✅ Bounding box + confidence score  
✅ Data augmentation untuk training lebih stabil  
✅ Simple & beginner friendly code structure  
✅ Bisa dijadikan mini AI surveillance project

---

# 🧠 Tech Stack

- Python
- TensorFlow / Keras
- OpenCV
- NumPy
- Haar Cascade Face Detection

---

# 📂 Project Structure

```bash
mask-detector/
│
├── app.py                     # Real-time detection
├── training.py                # Training model
├── mask_detector.keras        # Trained model
│
├── Face_Mask_Dataset/
│   ├── Train/
│   ├── Validation/
│   └── Test/
│
└── README.md
```

---

# ⚙️ How It Works

## 1️⃣ Face Detection
OpenCV menggunakan Haar Cascade untuk mendeteksi lokasi wajah dari webcam.

## 2️⃣ Preprocessing
Wajah yang terdeteksi akan:
- di-crop
- di-resize ke `160x160`
- dikirim ke model TensorFlow

## 3️⃣ Prediction
Model akan mengklasifikasikan wajah menjadi:

| Class | Label |
|---|---|
| 0 | 😷 Pakai Masker |
| 1 | 🚫 Tidak Pakai Masker |

## 4️⃣ Alert System
Jika tidak memakai masker:
- bounding box berubah merah
- alarm beep otomatis berbunyi

---

# 🏗️ CNN Architecture

Model CNN yang digunakan:

```text
Input (160x160x3)
↓
Conv2D(32) + MaxPool
↓
Conv2D(64) + MaxPool
↓
Conv2D(128) + MaxPool
↓
Conv2D(256) + MaxPool
↓
Flatten
↓
Dense(256)
↓
Dropout(0.5)
↓
Dense(2, Softmax)
```

---

# 📦 Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/rafiramdhani12/mask-detection.git
cd mask-detector
```

---

## 2️⃣ Install Dependencies

```bash
pip install tensorflow opencv-python numpy
```

---

# 📁 Dataset Setup

Struktur dataset wajib seperti ini:

```bash
Face_Mask_Dataset/
│
├── Train/
│   ├── with_mask/
│   └── without_mask/
│
├── Validation/
│   ├── with_mask/
│   └── without_mask/
│
└── Test/
    ├── with_mask/
    └── without_mask/
```

---

# 🧪 Training Model

Jalankan:

```bash
python training.py
```

Setelah training selesai:

```bash
mask_detector_update.keras
```

akan otomatis tersimpan.

---

# 🎥 Run Real-Time Detection

Rename model hasil training menjadi:

```bash
mask_detector.keras
```

Lalu jalankan:

```bash
python app.py
```

---

# ⌨️ Controls

| Key | Action |
|---|---|
| `Q` | Exit Program |

---

# 🔊 Alert System

Sistem menggunakan:

```python
winsound.Beep()
```

Sehingga:
- ✅ otomatis bekerja di Windows
- ⚠️ belum cross-platform untuk Linux/MacOS

---

# 📊 Example Output

```text
😷 Aman: Pakai Masker (98.2%)

🚫 AWAS: GAK PAKE MASKER! (99.1%)
```

---

# 🧹 Data Augmentation

Untuk meningkatkan generalisasi model:

```python
RandomFlip
RandomRotation
RandomZoom
RandomBrightness
```

---

# 📈 Future Improvements

- [ ] MobileNetV2 Transfer Learning
- [ ] GPU Optimization
- [ ] Multi-face tracking
- [ ] Save screenshot pelanggaran
- [ ] Telegram/Discord notification
- [ ] Cross-platform audio alert
- [ ] Web dashboard monitoring

---

# 🐛 Common Errors

## Webcam Tidak Terdeteksi

Ganti:

```python
cv2.VideoCapture(0)
```

menjadi:

```python
cv2.VideoCapture(1)
```

---

## TensorFlow Tidak Terinstall

Install manual:

```bash
pip install tensorflow
```

---

## OpenCV Error

Install ulang:

```bash
pip uninstall opencv-python
pip install opencv-python
```

---

# 💡 Educational Purpose

Project ini cocok untuk belajar:

- Computer Vision
- Deep Learning
- CNN
- Real-time AI
- OpenCV Integration
- TensorFlow Workflow

---

# 🧑‍💻 Author

Made with ☕ + Python + sedikit rasa frustasi debugging.

---

# ⭐ Bonus Tips

Kalau mau akurasi lebih tinggi:
- gunakan dataset lebih besar
- gunakan transfer learning (`MobileNetV2`)
- training lebih lama
- gunakan GPU

---

# 📜 License

Free to use for educational and personal projects.
