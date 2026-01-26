# Quick Start Script - Run Backend Server
# Activate venv and start the server

Write-Host "Starting UdaanSetu.AI Backend Server..." -ForegroundColor Green
Write-Host ""

# Activate virtual environment
& .\venv\Scripts\Activate.ps1

# Run the server
Write-Host "Server starting at http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs available at http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
