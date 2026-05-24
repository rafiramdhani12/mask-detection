# Mask Detector - Sistem Monitoring Visi Real-time

Aplikasi deteksi masker wajah real-time yang modern, dibangun menggunakan backend **Flask** dan frontend **React**. Projek ini memanfaatkan *deep learning* untuk mengidentifikasi apakah seseorang menggunakan masker dengan benar melalui *webcam feed*.

## 🚀 Fitur Utama

- **Deteksi Real-time:** Monitoring *feed* webcam dengan frekuensi tinggi (setiap 300ms).
- **Deep Learning Model:** Menggunakan arsitektur **MobileNetV2** yang efisien dan akurat untuk klasifikasi masker.
- **Face Detection Tangguh:** Menggunakan **MediaPipe Face Detection** untuk pelacakan wajah yang stabil di berbagai kondisi.
- **Visual Feedback:** *Bounding box* dinamis dengan label warna (Hijau untuk "Aman", Merah untuk "Peringatan").
- **Audio Alerts:** Notifikasi suara instan ketika terdeteksi orang yang tidak memakai masker.
- **Modern UI:** Dashboard bertema gelap (*dark mode*) yang elegan, dibangun dengan React dan Tailwind CSS.
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

Sistem ini menggunakan *pipeline* deteksi dua tahap:
1. **Face Detection:** MediaPipe (Short-range model) digunakan untuk mencari koordinat wajah dalam frame.
2. **Mask Classification:** Potongan wajah tersebut kemudian dikirim ke model **MobileNetV2** yang sudah dilatih untuk menentukan klasifikasi:
   - `Aman: Pakai Masker`
   - `AWAS: GAK PAKE MASKER!`

## 📄 Lisensi

Projek ini dilisensikan di bawah MIT License.

---
Dibuat dengan ❤️ untuk keamanan bersama.
