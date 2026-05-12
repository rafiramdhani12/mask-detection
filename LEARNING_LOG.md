# Learning Log: Mask Detection Web Migration & Debugging

Dokumen ini ngerangkum perjalanan migrasi dari script Python lokal ke Web App (Flask + React) dan solusi dari masalah-masalah teknis yang muncul. Cocok buat bahan belajar atau laporan tugas kuliah.

---

## 1. Arsitektur: Local vs Web

### Kondisi Awal (Local Script)
- **Library:** OpenCV (`cv2`), TensorFlow/Keras.
- **Webcam:** Diakses langsung oleh Python (`cv2.VideoCapture`).
- **UI:** Window OpenCV yang sangat terbatas (ndak bisa di-styling).
- **Issue:** Ndak bisa diakses lewat browser dan susah dikembangin tampilannya.

### Kondisi Baru (Web App)
- **Frontend (React):** Tugasnya cuma nangkep frame kamera pake browser, nampilin UI yang cantik (Tailwind CSS), dan manggil API.
- **Backend (Flask):** Tugasnya berat (Inference). Dia nerima gambar, deteksi wajah, dan klasifikasi masker pake model AI lu.
- **Komunikasi:** Pake HTTP POST (JSON) buat kirim gambar Base64 dari React ke Flask.

---

## 2. Masalah Teknis & Solusinya (The "Why")

### A. Bias Prediksi: Masalah Warna (BGR vs RGB)
- **Masalah:** OpenCV secara default baca gambar dalam format **BGR**, tapi hampir semua model AI (termasuk MobileNetV2 lu) dilatih pake format **RGB**.
- **Dampak:** AI jadi "buta warna". Dia ngira warna kulit itu biru atau masker biru itu merah. Hasilnya prediksi jadi bias.
- **Solusi:** Kita tambah `cv2.cvtColor(face_resized, cv2.COLOR_BGR2RGB)` sebelum dikirim ke model.

### B. Double Preprocessing & Scaling
- **Masalah:** Di `training.py` ada layer `Rescaling(1./255)`. Tapi di script awal, kita juga pake `preprocess_input` dari MobileNetV2.
- **Dampak:** Gambar lu di-scale dua kali. Angkanya jadi sangat kecil (mendekati nol). AI jadi bingung dan milih kelas secara acak/bias.
- **Solusi:** Kita harus pastiin preprocessing di Web sama persis dengan pas Training. Kita pake `preprocess_input` karena MobileNetV2 butuh range `-1` s/d `1`.

### C. Index Label Tertukar
- **Masalah:** Urutan kelas (0 atau 1) ditentukan secara alfabetis oleh foldernya (`WithMask` vs `WithoutMask`).
- **Dampak:** Seringkali user ketuker mana yang 0 mana yang 1.
- **Solusi:** Kita mapping secara manual di `self.labels` supaya lebih gampang di-swap kalau ada kesalahan urutan.

---

## 3. Apa Aja yang Diubah?

1.  **`backend/main.py`:** Bikin server Flask buat jadi "otak" aplikasi.
2.  **`backend/detector.py`:** Mindahin logika deteksi dari OpenCV lama ke class Python yang lebih rapi. Di sini kunci perbaikan BGR/RGB tadi.
3.  **`frontend/src/App.jsx`:** Bikin UI React. Gw tambahin fitur **Camera Selector** (biar lu bisa milih index kamera 2 lu lewat web) dan **Toggle Camera** buat hemat resource server.
4.  **`postcss.config.js` & `index.css`:** Penyesuaian ke **Tailwind CSS v4** yang punya cara install baru.

---

## 4. Tips Buat Tugas Kuliah
Kalau ditanya dosen kenapa aplikasinya nggak berat di server:
> *"Pak/Bu, saya sudah mengoptimasi **inference interval** menjadi 3 frame per detik (300ms) dan menyediakan fitur **Toggle Camera** di frontend. Jadi server hanya memproses gambar saat dibutuhkan saja, tidak terus-menerus memakan CPU."*

---
*Dibuat dengan ☕ untuk membantu tugas kuliah lu!*
