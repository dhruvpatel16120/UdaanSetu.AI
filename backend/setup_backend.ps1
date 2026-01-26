# ===============================================
# Backend Setup Script for UdaanSetu.AI
# Auto-detects Python and sets up complete backend
# ===============================================

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

# Function to print colored messages
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Function to print section headers
function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-ColorOutput "============================================" $InfoColor
    Write-ColorOutput $Title $InfoColor
    Write-ColorOutput "============================================" $InfoColor
}

# Function to find Python installation
function Find-Python {
    Write-ColorOutput "Searching for Python installation..." $InfoColor
    
    # List of common Python locations
    $PythonPaths = @(
        "python",
        "python3",
        "py",
        "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python310\python.exe",
        "$env:LOCALAPPDATA\Programs\Python\Python39\python.exe",
        "C:\Python312\python.exe",
        "C:\Python311\python.exe",
        "C:\Program Files\Anaconda\python.exe",
        "C:\Python310\python.exe",
        "C:\Python39\python.exe",
        "C:\Program Files\Python312\python.exe",
        "C:\Program Files\Python311\python.exe",
        "C:\Program Files\Python310\python.exe",
        "C:\Program Files\Python39\python.exe",

        "$env:USERPROFILE\AppData\Local\Programs\Python\Python312\python.exe",
        "$env:USERPROFILE\AppData\Local\Programs\Python\Python311\python.exe",
        "$env:USERPROFILE\AppData\Local\Programs\Python\Python310\python.exe",
        "$env:USERPROFILE\anaconda3\python.exe",
        "C:\ProgramData\Anaconda3\python.exe"
    )
    
    foreach ($Path in $PythonPaths) {
        try {
            $Version = & $Path --version 2>&1
            # Skip Windows Store stub
            if ($Version -match "Microsoft Store" -or $Version -match "run without arguments to install") {
                continue
            }
            if ($LASTEXITCODE -eq 0 -or $Version -match "Python") {
                Write-ColorOutput "[OK] Found Python: $Path" $SuccessColor
                Write-ColorOutput "     Version: $Version" $InfoColor
                return $Path
            }
        } catch {
            continue
        }
    }
    
    # If not found, try using where command
    try {
        $WherePython = where.exe python 2>$null
        if ($WherePython) {
            $Version = & $WherePython[0] --version 2>&1
            Write-ColorOutput "[OK] Found Python using 'where': $($WherePython[0])" $SuccessColor
            Write-ColorOutput "     Version: $Version" $InfoColor
            return $WherePython[0]
        }
    } catch {
        # Continue to error
    }
    
    Write-ColorOutput "[ERROR] Python not found!" $ErrorColor
    Write-ColorOutput "Please install Python from https://www.python.org/downloads/" $ErrorColor
    Write-ColorOutput "Or make sure Python is in your PATH" $ErrorColor
    throw "Python installation not found"
}

# Main setup function
function Setup-Backend {
    try {
        # Get the script directory (backend folder)
        $BackendPath = $PSScriptRoot
        if (-not $BackendPath) {
            $BackendPath = Get-Location
        }
        
        Write-Section "Backend Setup for UdaanSetu.AI"
        Write-ColorOutput "Working Directory: $BackendPath" $InfoColor
        Write-Host ""

        # Step 0: Find Python
        Write-Section "Step 0: Detecting Python Installation"
        $PythonExe = Find-Python
        
        # Step 1: Check and Create Virtual Environment
        Write-Section "Step 1: Setting up Virtual Environment"
        
        $VenvPath = Join-Path $BackendPath "venv"
        $VenvPython = Join-Path $VenvPath "Scripts\python.exe"
        $VenvPip = Join-Path $VenvPath "Scripts\pip.exe"
        $VenvActivate = Join-Path $VenvPath "Scripts\Activate.ps1"
        
        if (Test-Path $VenvPath) {
            Write-ColorOutput "[INFO] Virtual environment folder exists, validating..." $InfoColor
            
            # Verify venv is valid and not from another machine
            if (-not (Test-Path $VenvPython)) {
                Write-ColorOutput "[WARNING] Virtual environment appears corrupted or from different machine" $WarningColor
                Write-ColorOutput "[INFO] Recreating virtual environment..." $InfoColor
                Remove-Item -Recurse -Force $VenvPath
                & $PythonExe -m venv venv
                if ($LASTEXITCODE -ne 0) {
                    throw "Failed to create virtual environment"
                }
                Write-ColorOutput "[OK] Virtual environment recreated" $SuccessColor
            } else {
                # Test if venv python actually works
                try {
                    $TestVenv = & $VenvPython --version 2>&1
                    if ($LASTEXITCODE -ne 0 -or $TestVenv -match "cannot find") {
                        Write-ColorOutput "[WARNING] Virtual environment is corrupted (from different machine/path)" $WarningColor
                        Write-ColorOutput "[INFO] Recreating virtual environment..." $InfoColor
                        Remove-Item -Recurse -Force $VenvPath
                        & $PythonExe -m venv venv
                        if ($LASTEXITCODE -ne 0) {
                            throw "Failed to create virtual environment"
                        }
                        Write-ColorOutput "[OK] Virtual environment recreated" $SuccessColor
                    } else {
                        Write-ColorOutput "[OK] Virtual environment is valid" $SuccessColor
                    }
                } catch {
                    Write-ColorOutput "[WARNING] Cannot validate venv, recreating..." $WarningColor
                    Remove-Item -Recurse -Force $VenvPath
                    & $PythonExe -m venv venv
                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to create virtual environment"
                    }
                    Write-ColorOutput "[OK] Virtual environment recreated" $SuccessColor
                }
            }
        } else {
            Write-ColorOutput "Creating new virtual environment..." $InfoColor
            
            try {
                & $PythonExe -m venv venv
                if ($LASTEXITCODE -ne 0) {
                    throw "Failed to create virtual environment"
                }
                Write-ColorOutput "[OK] Virtual environment created successfully" $SuccessColor
            } catch {
                Write-ColorOutput "[ERROR] Error creating virtual environment: $_" $ErrorColor
                Write-ColorOutput "Trying with virtualenv package..." $WarningColor
                
                # Install and use virtualenv
                & $PythonExe -m pip install virtualenv
                & $PythonExe -m virtualenv venv
                
                if (-not (Test-Path $VenvPath)) {
                    throw "Failed to create virtual environment with virtualenv"
                }
                Write-ColorOutput "[OK] Virtual environment created with virtualenv" $SuccessColor
            }
        }
        
        # Verify venv python exists
        if (-not (Test-Path $VenvPython)) {
            throw "Virtual environment Python not found at: $VenvPython"
        }
        
        Write-ColorOutput "[INFO] Using venv Python: $VenvPython" $InfoColor

        # Step 2: Upgrade pip in venv
        Write-Section "Step 2: Upgrading pip"
        
        try {
            Write-ColorOutput "Upgrading pip in virtual environment..." $InfoColor
            & $VenvPython -m pip install --upgrade pip --quiet
            
            if ($LASTEXITCODE -ne 0) {
                Write-ColorOutput "[WARNING] Failed to upgrade pip, continuing..." $WarningColor
            } else {
                Write-ColorOutput "[OK] Pip upgraded successfully" $SuccessColor
            }
        } catch {
            Write-ColorOutput "[WARNING] Error upgrading pip: $_" $WarningColor
        }

        # Step 3: Install Requirements
        Write-Section "Step 3: Installing Python Dependencies"
        
        $RequirementsPath = Join-Path $BackendPath "requirements.txt"
        
        if (-not (Test-Path $RequirementsPath)) {
            Write-ColorOutput "[ERROR] requirements.txt not found at: $RequirementsPath" $ErrorColor
            throw "requirements.txt not found"
        }
        
        Write-ColorOutput "Installing packages from requirements.txt..." $InfoColor
        Write-ColorOutput "(This may take a few minutes...)" $WarningColor
        
        & $VenvPip install -r $RequirementsPath
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "[ERROR] Failed to install some packages" $ErrorColor
            Write-ColorOutput "Trying to continue anyway..." $WarningColor
        } else {
            Write-ColorOutput "[OK] All packages installed successfully" $SuccessColor
        }

        # Step 4: Generate Prisma Client
        Write-Section "Step 4: Generating Prisma Client"
        
        $PrismaSchemaPath = Join-Path $BackendPath "prisma\schema.prisma"
        
        if (-not (Test-Path $PrismaSchemaPath)) {
            Write-ColorOutput "[ERROR] Prisma schema not found at: $PrismaSchemaPath" $ErrorColor
            throw "Prisma schema file missing"
        }
        
        try {
            Write-ColorOutput "Running prisma generate..." $InfoColor
            
            # Use venv python to run prisma
            & $VenvPython -m prisma generate
            
            if ($LASTEXITCODE -ne 0) {
                throw "Prisma generate failed"
            }
            
            Write-ColorOutput "[OK] Prisma client generated successfully" $SuccessColor
            
        } catch {
            Write-ColorOutput "[ERROR] Error generating Prisma client: $_" $ErrorColor
            Write-ColorOutput "Attempting to reinstall prisma..." $WarningColor
            
            try {
                & $VenvPip install --force-reinstall prisma
                & $VenvPython -m prisma generate
                
                if ($LASTEXITCODE -ne 0) {
                    throw "Prisma generate failed after reinstall"
                }
                
                Write-ColorOutput "[OK] Prisma client generated successfully" $SuccessColor
            } catch {
                Write-ColorOutput "[ERROR] Failed to generate Prisma client: $_" $ErrorColor
                Write-ColorOutput "You may need to run manually: python -m prisma generate" $WarningColor
            }
        }

        # Step 5: Check Environment Variables
        Write-Section "Step 5: Validating Environment Configuration"
        
        $EnvPath = Join-Path $BackendPath ".env"
        
        if (-not (Test-Path $EnvPath)) {
            Write-ColorOutput "[WARNING] .env file not found!" $WarningColor
            Write-ColorOutput "Please create a .env file with the following variables:" $WarningColor
            Write-ColorOutput "  - DATABASE_URL" $WarningColor
            Write-ColorOutput "  - GEMINI_API_KEY" $WarningColor
        } else {
            Write-ColorOutput "[OK] .env file found" $SuccessColor
            
            # Check for required variables
            $EnvContent = Get-Content $EnvPath -Raw
            
            $RequiredVars = @("DATABASE_URL", "GEMINI_API_KEY")
            $MissingVars = @()
            
            foreach ($Var in $RequiredVars) {
                if ($EnvContent -notmatch "$Var\s*=\s*.+") {
                    $MissingVars += $Var
                }
            }
            
            if ($MissingVars.Count -gt 0) {
                Write-ColorOutput "[WARNING] Missing or empty environment variables:" $WarningColor
                foreach ($Var in $MissingVars) {
                    Write-ColorOutput "  - $Var" $WarningColor
                }
            } else {
                Write-ColorOutput "[OK] All required environment variables are configured" $SuccessColor
            }
        }

        # Step 6: Test Database Connection
        Write-Section "Step 6: Testing Database Connection"
        
        try {
            # Create a test script
            $TestScript = @"
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from dotenv import load_dotenv
    load_dotenv()
    
    from prisma import Prisma
    import asyncio
    
    async def test_connection():
        db = Prisma()
        print('[INFO] Connecting to database...')
        await db.connect()
        print('[OK] Database connection successful!')
        await db.disconnect()
        print('[OK] Database disconnected cleanly')
        return True
    
    result = asyncio.run(test_connection())
    sys.exit(0)
    
except ImportError as e:
    print(f'[ERROR] Import error: {e}')
    print('[INFO] Make sure all dependencies are installed')
    sys.exit(1)
    
except Exception as e:
    print(f'[ERROR] Database connection failed: {e}')
    print('[INFO] Please check your DATABASE_URL in .env file')
    sys.exit(1)
"@
            
            $TestScriptPath = Join-Path $BackendPath "test_db_connection_temp.py"
            Set-Content -Path $TestScriptPath -Value $TestScript -Encoding UTF8
            
            Write-ColorOutput "Testing database connection..." $InfoColor
            & $VenvPython $TestScriptPath
            
            $TestResult = $LASTEXITCODE
            
            # Clean up test script
            Remove-Item $TestScriptPath -ErrorAction SilentlyContinue
            
            if ($TestResult -eq 0) {
                Write-ColorOutput "[OK] Database connection test passed!" $SuccessColor
            } else {
                Write-ColorOutput "[ERROR] Database connection test failed" $ErrorColor
                Write-ColorOutput "Please verify:" $WarningColor
                Write-ColorOutput "  1. DATABASE_URL is correctly set in .env" $WarningColor
                Write-ColorOutput "  2. Database server is running and accessible" $WarningColor
                Write-ColorOutput "  3. Credentials are correct" $WarningColor
            }
            
        } catch {
            Write-ColorOutput "[ERROR] Error testing database connection: $_" $ErrorColor
            Write-ColorOutput "Please manually verify database connectivity" $WarningColor
        }

        # Step 7: Database Schema Sync (Optional)
        Write-Section "Step 7: Database Schema Synchronization"
        
        Write-ColorOutput "Would you like to sync the database schema now? (Y/N)" $WarningColor
        Write-ColorOutput "(This will apply any pending migrations to your database)" $InfoColor
        $Response = Read-Host "Enter choice"
        
        if ($Response -eq 'Y' -or $Response -eq 'y') {
            try {
                Write-ColorOutput "Running prisma db push..." $InfoColor
                & $VenvPython -m prisma db push
                
                if ($LASTEXITCODE -ne 0) {
                    throw "Prisma db push failed"
                }
                
                Write-ColorOutput "[OK] Database schema synced successfully!" $SuccessColor
            } catch {
                Write-ColorOutput "[ERROR] Error syncing database schema: $_" $ErrorColor
                Write-ColorOutput "You can manually run later:" $WarningColor
                Write-ColorOutput "  .\venv\Scripts\Activate.ps1" $WarningColor
                Write-ColorOutput "  python -m prisma db push" $WarningColor
            }
        } else {
            Write-ColorOutput "[SKIP] Skipping database schema sync" $InfoColor
            Write-ColorOutput "Run manually when ready: python -m prisma db push" $InfoColor
        }

        # Final Summary
        Write-Section "Setup Complete!"
        
        Write-ColorOutput "[SUCCESS] Backend setup completed successfully!" $SuccessColor
        Write-Host ""
        Write-ColorOutput "==================================================" $InfoColor
        Write-ColorOutput "Next Steps - How to Run the Backend:" $SuccessColor
        Write-ColorOutput "==================================================" $InfoColor
        Write-Host ""
        Write-ColorOutput "1. Activate virtual environment:" $InfoColor
        Write-ColorOutput "   .\venv\Scripts\Activate.ps1" $WarningColor
        Write-Host ""
        Write-ColorOutput "2. Run the development server:" $InfoColor
        Write-ColorOutput "   python -m uvicorn main:app --reload" $WarningColor
        Write-Host ""
        Write-ColorOutput "3. Access API documentation:" $InfoColor
        Write-ColorOutput "   http://localhost:8000/docs" $WarningColor
        Write-Host ""
        Write-ColorOutput "==================================================" $InfoColor
        Write-Host ""
        
        # Create a quick start script
        $QuickStartScript = @"
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
"@
        
        $QuickStartPath = Join-Path $BackendPath "start_server.ps1"
        Set-Content -Path $QuickStartPath -Value $QuickStartScript -Encoding UTF8
        
        Write-ColorOutput "[INFO] Created quick start script: start_server.ps1" $InfoColor
        Write-ColorOutput "Run .\start_server.ps1 to quickly start the backend server" $InfoColor
        Write-Host ""
        
    } catch {
        Write-Section "Setup Failed!"
        Write-ColorOutput "[ERROR] Backend setup encountered an error:" $ErrorColor
        Write-ColorOutput $_.Exception.Message $ErrorColor
        Write-Host ""
        Write-ColorOutput "Stack Trace:" $WarningColor
        Write-ColorOutput $_.ScriptStackTrace $WarningColor
        Write-Host ""
        exit 1
    }
}

# Run the setup
Setup-Backend
