# Mask Detection Web App

This project is a web-based real-time mask detection application using Flask (Backend) and React (Frontend).

## Prerequisites
- Python 3.12
- Node.js & npm

## Structure
- `backend/`: Flask server with Keras model inference.
- `frontend/`: React + Vite + Tailwind CSS for the user interface.

## Running the Application

### 1. Backend (Flask)
The backend is configured to run on `http://localhost:5000`.
```bash
cd backend
../venv/bin/python main.py
```

### 2. Frontend (React)
The frontend is configured to run on `http://localhost:5173`.
```bash
cd frontend
npm install
npm run dev
```

## Features
- Real-time webcam feed.
- Face detection using Haar Cascades.
- Mask classification using MobileNetV2-based Keras model.
- Visual bounding boxes and status labels.
- Audio alerts when no mask is detected.
