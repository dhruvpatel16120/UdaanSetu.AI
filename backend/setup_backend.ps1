# Setup backend virtual environment and dependencies for UdaanSetu.AI
# Run this script from the /backend directory.

Write-Host "Creating Python virtual environment in 'backend/venv'..." -ForegroundColor Green
python -m venv venv

Write-Host "Activating virtual environment and installing dependencies..." -ForegroundColor Green
.\venv\Scripts\pip install -r requirements.txt

Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host "To run the FastAPI server, execute: .\venv\Scripts\python main.py" -ForegroundColor Cyan
