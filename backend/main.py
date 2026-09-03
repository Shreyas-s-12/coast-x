import sys
from pathlib import Path

# Add project root to sys.path so 'backend' package imports resolve smoothly
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import Config
from backend.api.routes import router as api_router
from backend.utils.helpers import get_logger

logger = get_logger("Main")

app = FastAPI(
    title=Config.PROJECT_NAME,
    version=Config.VERSION,
    description="CoastX AI Coastal Intelligence & Threat Monitoring API"
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(api_router)

# Mount static outputs directory
app.mount("/outputs", StaticFiles(directory=str(Config.OUTPUT_DIR)), name="outputs")

logger.info("FastAPI Application Initialized.")

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
