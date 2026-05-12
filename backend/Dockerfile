# 1. Pake base image python yang enteng tapi stabil
FROM python:3.10-slim

# 2. Set working directory di dalam container
WORKDIR /app

# 3. Install dependency sistem yang dibutuhin OpenCV
# libgl1-mesa-glx dan libglib2.0-0 itu WAJIB biar cv2 bisa jalan di Linux
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 4. Copy requirements dulu (biar kalau ada perubahan kode, gak usah install ulang library)
COPY requirements.txt .

# 5. Install library python
# --no-cache-dir biar ukuran image gak bengkak
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy semua file project (app.py, detector.py, folder models, dll)
COPY . .

# 7. Render/Railway butuh port dinamis, kita default ke 5000 sesuai kode lu
# Tapi nanti bakal di-override sama Render lewat environment variable
ENV PORT=5000

# 8. Jalankan aplikasi pake Gunicorn (lebih stabil buat production dibanding app.run)
# Kita pake gunicorn biar Flask-nya gak gampang mati
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:$PORT app:app"]