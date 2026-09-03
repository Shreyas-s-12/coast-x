# CoastX Platform Launcher
# Starts FastAPI backend (port 8000) and React/Vite frontend (port 5173)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "      Starting CoastX AI Platform       " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$PROJECT_ROOT = "C:\CoastX"

# Activate Virtual Environment if present
if (Test-Path "$PROJECT_ROOT\venv\Scripts\Activate.ps1") {
    Write-Host "[1/2] Activating Python Virtual Environment..." -ForegroundColor Green
    & "$PROJECT_ROOT\venv\Scripts\Activate.ps1"
}

# Start Backend Service in new terminal process
Write-Host "[2/2] Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PROJECT_ROOT\backend'; python main.py"

# Start Frontend Service in new terminal process
Write-Host "[3/3] Launching React Frontend on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PROJECT_ROOT\frontend'; npm run dev"

Write-Host "CoastX Platform initialized successfully." -ForegroundColor Cyan
