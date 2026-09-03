# COASTX — AI Coastal Intelligence Platform

CoastX is a web application for real-time coastal hazard detection, multi-object tracking (ByteTrack), and automated transparent risk scoring.

---

## 📁 Project Architecture

```
CoastX/
├── backend/
│   ├── api/
│   │   └── routes.py           # REST API routes (Health, Image, Video, Stats, Events)
│   ├── models/
│   │   ├── detector.py         # Real Ultralytics YOLO loader & inference
│   │   ├── tracker.py          # Persistent ObjectTracker (ByteTrack integration)
│   │   └── risk_engine.py      # CoastalRiskEngine (transparent risk score & levels)
│   ├── services/
│   │   ├── detection.py        # Object detection, tracking & risk calculation logic
│   │   ├── inference_service.py # Inference service orchestrator
│   │   ├── image_processor.py  # Image processing service
│   │   └── video_processor.py  # Video frame-by-frame processing & tracking pipeline
│   ├── utils/
│   ├── config.py               # Central backend configuration
│   └── main.py                 # FastAPI Uvicorn entrypoint (Port 8000)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Upload.jsx            # Media ingestion (Image/Video)
│   │   │   ├── DetectionView.jsx     # Processed image/video player feed
│   │   │   ├── ObjectStats.jsx       # Dynamic class counts
      │   │   ├── RiskPanel.jsx         # Coastal risk score & level display
      │   │   ├── AlertPanel.jsx        # Real-time backend alerts
│   │   │   ├── EventsLogView.jsx     # Recorded CSV event log table
│   │   │   └── AboutView.jsx         # Architectural system specs
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # Command Center & navigation controller
│   │   │   ├── ImageAnalysisPage.jsx # Dedicated image analysis view
│   │   │   └── VideoAnalysisPage.jsx # Dedicated video analysis view
│   │   ├── services/
│   │   │   └── api.js                # Frontend API client (http://127.0.0.1:8000)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                 # Dark coastal glassmorphism UI theme
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                # Vite frontend dev server (Port 5173)
│
├── data/                             # Roboflow dataset
├── models/
│   └── coastx_best.pt                # Trained YOLO weights target path
├── outputs/
│   ├── images/                       # Annotated image outputs
│   ├── videos/                       # Processed video outputs
│   └── events/events.csv             # Recorded event log
├── scripts/
├── .env
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 🚀 Running the Application

### 1. Start the FastAPI Backend

```bash
cd C:\CoastX\backend
python main.py
```
- API Server: `http://127.0.0.1:8000`
- Health Endpoint: `http://127.0.0.1:8000/health`

### 2. Start the React + Vite Frontend

```bash
cd C:\CoastX\frontend
npm install
npm run dev
```
- Dashboard UI: `http://localhost:5173`

---

## 🎯 Model Readiness & Verification

- The backend loads the trained model from: `C:\CoastX\models\coastx_best.pt`
- If `coastx_best.pt` does not exist or is not trained yet, the backend responds with:
  ```json
  {
    "success": false,
    "error": "CoastX model not trained yet."
  }
  ```
- The React frontend cleanly displays the status "CoastX model not trained yet." without substituting fake detection results.
