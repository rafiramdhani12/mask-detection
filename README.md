# Mask Detector - Sistem Monitoring Visi Real-time

Aplikasi deteksi masker wajah real-time yang modern, dibangun menggunakan backend **Flask** dan frontend **React**. Projek ini memanfaatkan _deep learning_ untuk mengidentifikasi apakah seseorang menggunakan masker dengan benar melalui _webcam feed_.

## 🚀 Fitur Utama

- **Deteksi Real-time:** Monitoring _feed_ webcam dengan frekuensi tinggi (setiap 300ms).
- **Deep Learning Model:** Menggunakan arsitektur **MobileNetV2** yang efisien dan akurat untuk klasifikasi masker.
- **Face Detection Tangguh:** Menggunakan **MediaPipe Face Detection** untuk pelacakan wajah yang stabil di berbagai kondisi.
- **Visual Feedback:** _Bounding box_ dinamis dengan label warna (Hijau untuk "Aman", Merah untuk "Peringatan").
- **Audio Alerts:** Notifikasi suara instan ketika terdeteksi orang yang tidak memakai masker.
- **Modern UI:** Dashboard bertema gelap (_dark mode_) yang elegan, dibangun dengan React dan Tailwind CSS.
- **Pilihan Kamera:** Mendukung penggunaan berbagai perangkat input video (kamera eksternal/internal).
- **Docker Ready:** Backend sudah ter-kontainerisasi sehingga mudah untuk di-deploy.

## 🛠️ Tech Stack

### Backend

- **Framework:** Flask (Python)
- **AI/ML:** TensorFlow 2.16+, MediaPipe 0.10.9
- **Image Processing:** OpenCV
- **Server:** Gunicorn (untuk produksi)

### Frontend

- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Webcam Integration:** `react-webcam`
- **API Client:** Axios

## 📋 Prasyarat (Prerequisites)

Sebelum menjalankan projek ini, pastikan kamu sudah menginstal:

- Python 3.9 atau versi lebih tinggi
- Node.js 18 atau versi lebih tinggi
- Webcam (internal atau eksternal)

## 🔧 Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/username-kamu/mask-detection.git
cd mask-detection
```

### 2. Setup Backend (Python)

```bash
cd backend
# Buat virtual environment
python -m venv venv

# Aktifkan virtual environment
# Di Windows:
.\venv\Scripts\activate
# Di Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Jalankan server
python main.py
```

Backend akan berjalan di `http://localhost:5000`.

### 3. Setup Frontend (React)

```bash
cd ../frontend

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`.

> **Catatan:** Pastikan file `.env` di folder frontend sudah berisi `VITE_API_URL=http://localhost:5000`.

## 🖥️ Cara Penggunaan

1. **Jalankan Backend & Frontend:** Pastikan kedua server (Flask dan Vite) sudah berjalan sesuai instruksi di atas.
2. **Buka Browser:** Akses alamat `http://localhost:5173`.
3. **Berikan Izin Kamera:** Klik tombol **"Allow"** saat browser meminta akses ke webcam.
4. **Klik "Start Camera":** Gunakan tombol kontrol di dashboard untuk menyalakan kamera.
5. **Monitoring:**
   - Jika wajah terdeteksi memakai masker, kotak **Hijau** akan muncul dengan label "Aman".
   - Jika wajah terdeteksi tidak memakai masker, kotak **Merah** akan muncul dan sistem akan membunyikan suara **beep** sebagai peringatan.
6. **Ganti Kamera:** Jika kamu punya lebih dari satu kamera, gunakan dropdown **"Select Camera"** untuk menggantinya.

## 🐳 Deployment dengan Docker

Jika ingin menjalankan backend menggunakan Docker:

```bash
cd backend
docker build -t mask-detector-backend .
docker run -p 5000:5000 mask-detector-backend
```

## 📂 Struktur Projek

```text
mask-detection/
├── backend/            # Flask API & Model AI
│   ├── main.py         # Entry point aplikasi
│   ├── detector.py     # Logika deteksi & pemrosesan gambar
│   ├── models/         # File weights model (.h5)
│   └── Dockerfile      # Konfigurasi Docker backend
├── frontend/           # Aplikasi React
│   ├── src/
│   │   ├── App.jsx     # Logika utama Dashboard
│   │   └── main.jsx    # Entry point React
│   └── tailwind.config.js
└── README.md           # Dokumentasi ini
```

## 🧠 Detail Model

Sistem ini menggunakan _pipeline_ deteksi dua tahap:

1. **Face Detection:** MediaPipe (Short-range model) digunakan untuk mencari koordinat wajah dalam frame.
2. **Mask Classification:** Potongan wajah tersebut kemudian dikirim ke model **MobileNetV2** yang sudah dilatih untuk menentukan klasifikasi:
   - `Aman: Pakai Masker`
   - `AWAS: GAK PAKE MASKER!`

## 📄 Lisensi

Projek ini dilisensikan di bawah MIT License.

---

Dibuat dengan ❤️ untuk keamanan bersama.

# 🛡️ Sistem Monitoring Masker Real-Time Berbasis Web

### Menggunakan Transfer Learning MobileNetV2 dan MediaPipe

> Proyek ini membangun sistem deteksi penggunaan masker secara real-time berbasis web app, yang mampu mendeteksi wajah dan mengklasifikasikan apakah seseorang memakai masker atau tidak melalui kamera secara langsung.

---

## 📌 Latar Belakang

Kepatuhan penggunaan masker di instansi kesehatan, industri pangan, dan laboratorium masih menjadi tantangan operasional yang nyata. Pengawasan manual memiliki keterbatasan — tidak scalable, rentan human error, dan tidak bisa berjalan 24 jam. Sistem ini hadir sebagai solusi otomasi compliance monitoring berbasis computer vision yang dapat diintegrasikan ke infrastruktur CCTV yang sudah ada tanpa hardware tambahan.

---

## 🎯 Tujuan Proyek

- Membangun model klasifikasi masker dengan akurasi tinggi menggunakan Transfer Learning
- Mengintegrasikan deteksi wajah real-time menggunakan MediaPipe
- Menyajikan hasil monitoring melalui antarmuka web yang informatif dan responsif
- Memberikan alert otomatis ketika pelanggaran terdeteksi

---

## 🧠 Arsitektur Sistem

```
Kamera (Webcam)
    ↓
MediaPipe Face Detection
(Deteksi & lokalisasi wajah, ekstrak ROI hidung-mulut)
    ↓
MobileNetV2 (Transfer Learning)
(Klasifikasi: WithMask / WithoutMask)
    ↓
Flask API Backend
(Proses gambar, kembalikan hasil + summary)
    ↓
React Frontend
(Tampilkan bounding box, status CLEAR/VIOLATION, statistik)
```

---

## 🗂️ Struktur Dataset

Dataset terdiri dari dua kelas:

| Kelas         | Deskripsi                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------ |
| `WithMask`    | Wajah dengan masker medis/surgical yang dipakai dengan benar                                     |
| `WithoutMask` | Wajah tanpa masker, termasuk tangan menutupi mulut, kain/baju menutupi wajah, dan masker di dagu |

### Distribusi Dataset

| Split      | WithMask | WithoutMask | Total   |
| ---------- | -------- | ----------- | ------- |
| Train      | 5.000    | 5.000+      | 10.000+ |
| Validation | 400      | 400         | 800     |
| Test       | 483      | 570         | 1.053   |

> Dataset Train diperkaya dengan **hard negative samples** dari lingkungan nyata (webcam indoor) untuk meningkatkan robustness model terhadap false positive seperti tangan/kain menutupi wajah.

---

## ⚙️ Konfigurasi Training

| Parameter     | Nilai                                  |
| ------------- | -------------------------------------- |
| Input Size    | 160 × 160 px                           |
| Batch Size    | 32                                     |
| Epochs        | 10                                     |
| Optimizer     | Adam                                   |
| Loss Function | Sparse Categorical Crossentropy        |
| Base Model    | MobileNetV2 (ImageNet weights, frozen) |

---

## 🏗️ Arsitektur Model

```
Input (160, 160, 3)
    ↓
MobileNetV2 (pretrained ImageNet, base_trainable=False)
    ↓
GlobalAveragePooling2D
    ↓
Dropout (0.3)
    ↓
Dense (128, ReLU)
    ↓
Dense (2, Softmax) → [WithMask, WithoutMask]
```

**Total Parameters:** 2,422,210 (9.24 MB)

- Trainable: 164,226 (641.51 KB)
- Non-trainable: 2,257,984 (8.61 MB)

---

## 📊 Hasil Training

### Akurasi per Epoch

| Epoch | Train Accuracy | Val Accuracy | Train Loss | Val Loss |
| ----- | -------------- | ------------ | ---------- | -------- |
| 1     | 99.26%         | 99.77%       | 0.0243     | 0.0051   |
| 5     | 99.89%         | 100.00%      | 0.0034     | 0.0002   |
| 10    | 99.92%         | 100.00%      | 0.0023     | 0.0001   |

### Evaluasi Test Set

| Metrik            | Nilai      |
| ----------------- | ---------- |
| **Test Accuracy** | **99.62%** |
| Test Loss         | 0.0064     |

### Classification Report

| Kelas        | Precision | Recall | F1-Score | Support   |
| ------------ | --------- | ------ | -------- | --------- |
| WithMask     | 1.00      | 0.99   | 1.00     | 483       |
| WithoutMask  | 0.99      | 1.00   | 1.00     | 570       |
| **Accuracy** |           |        | **1.00** | **1.053** |

### Confusion Matrix

```
                Predicted
              WithMask  WithoutMask
Actual WithMask    480          3
       WithoutMask  1         569
```

> Hanya 4 misklasifikasi dari 1.053 sampel test.

---

## 🛠️ Tech Stack

### Machine Learning

- Python 3.x
- TensorFlow / Keras
- MobileNetV2 (Transfer Learning)
- MediaPipe Face Detection
- OpenCV
- scikit-learn (evaluasi)

### Backend

- Flask
- flask-cors

### Frontend

- React (Vite)
- Tailwind CSS
- react-webcam
- Axios
- Lucide React

---

## 🚀 Cara Menjalankan

### 1. Persiapan Environment

```bash
# Clone repo
git clone <repo-url>
cd mask-detection
```

### 2. Jalankan Backend (Flask)

```bash
# Install dependencies
pip install flask flask-cors tensorflow mediapipe opencv-python numpy

# Pastikan weights ada di folder models/
# Struktur: models/mask_detector.weights.h5

# Jalankan server
python app.py
# Server berjalan di http://localhost:5000
```

### 3. Jalankan Frontend (React)

```bash
cd frontend
npm install
npm run dev
# Buka http://localhost:5173
```

### 4. Konfigurasi Environment Variable

Buat file `.env` di folder frontend:

```
VITE_API_URL=http://127.0.0.1:5000
```

---

## 🔁 Cara Melatih Ulang Model (Google Colab)

1. Upload dataset ke Google Drive dengan struktur:

```
datasets face detection.zip
└── Face Mask Dataset/
    ├── Train/
    │   ├── WithMask/
    │   └── WithoutMask/
    ├── Validation/
    │   ├── WithMask/
    │   └── WithoutMask/
    └── Test/
        ├── WithMask/
        └── WithoutMask/
```

2. Buka `training.ipynb` di Google Colab
3. Aktifkan GPU: `Runtime → Change runtime type → T4 GPU`
4. Jalankan semua cell secara berurutan
5. Weights otomatis ter-download sebagai `mask_detector.weights.h5`
6. Pindahkan weights ke folder `models/` di project

---

## ✨ Fitur Utama

- **Real-time Detection** — Proses frame setiap 300ms dari webcam
- **Multi-face Support** — Deteksi beberapa wajah sekaligus dalam satu frame
- **Status Monitoring** — Status AREA AMAN / PELANGGARAN TERDETEKSI secara live
- **Statistik Real-time** — Counter total wajah, pakai masker, tanpa masker
- **Alert Suara** — Bunyi notifikasi otomatis saat pelanggaran terdeteksi
- **Multi-camera** — Support pemilihan kamera input
- **Zero Additional Hardware** — Berjalan di browser, tidak perlu hardware khusus

---

## 🔮 Pengembangan Selanjutnya

- Integrasi **Smart Lock** — Pintu otomatis terkunci jika pelanggaran terdeteksi
- **Logging & History** — Rekam riwayat pelanggaran dengan timestamp
- **Notifikasi Push** — Alert ke petugas via email/WhatsApp
- **Dashboard Admin** — Monitoring multi-kamera dari satu panel
- Deployment ke **Raspberry Pi** untuk edge computing di lapangan

---

## 👥 Tim Pengembang

| Nama                     | NIM      | Kampus     |
| ------------------------ | -------- | ---------- |
| M.Akbar Ghozali          | 15240313 | Cut Mutiah |
| Muhammad Rafi Ramdhani   | 15240411 | Cut Mutiah |
| Jeremy Febrian Manuputty | 15240505 | Cut Mutiah |
| Arya Kurniawan           | 15240661 | Cut Mutiah |
| Maeyumedi Davi           | 15240975 | Cut Mutiah |

**Batch 6 — Universitas Bina Sarana Informatika (BSI)**
**Program Studi: Teknologi Informasi**

---

_Sistem ini merupakan proof-of-concept untuk automated compliance monitoring berbasis computer vision. Dikembangkan sebagai proyek kompetisi IT Camp BSI._
