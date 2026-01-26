# Backend Setup Script for UdaanSetu.AI
# This script sets up the complete backend environment

param(
    [string]$PythonPath = "python"
)

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

# Main setup function
function Setup-Backend {
    try {
        # Get the script directory (backend folder)
        $BackendPath = $PSScriptRoot
        if (-not $BackendPath) {
            $BackendPath = Get-Location
        }
        Set-Location $BackendPath
        
        Write-ColorOutput "Backend Setup Started" $SuccessColor
        Write-ColorOutput "Working Directory: $BackendPath" $InfoColor
        Write-Host ""

        # Step 1: Check and Create Virtual Environment
        Write-Section "Step 1: Checking Virtual Environment"
        
        $VenvPath = Join-Path $BackendPath "venv"
        
        if (Test-Path $VenvPath) {
            Write-ColorOutput "[OK] Virtual environment already exists at: $VenvPath" $SuccessColor
        } else {
            Write-ColorOutput "Creating new virtual environment..." $WarningColor
            
            try {
                & $PythonPath -m venv venv
                if ($LASTEXITCODE -ne 0) {
                    throw "Failed to create virtual environment"
                }
                Write-ColorOutput "[OK] Virtual environment created successfully" $SuccessColor
            } catch {
                Write-ColorOutput "[ERROR] Error creating virtual environment: $_" $ErrorColor
                Write-ColorOutput "Trying alternative method..." $WarningColor
                
                # Try with virtualenv package
                & $PythonPath -m pip install virtualenv
                & $PythonPath -m virtualenv venv
                
                if (-not (Test-Path $VenvPath)) {
                    throw "Failed to create virtual environment with alternative method"
                }
                Write-ColorOutput "[OK] Virtual environment created with virtualenv" $SuccessColor
            }
        }

        # Step 2: Activate Virtual Environment and Install Requirements
        Write-Section "Step 2: Installing Requirements"
        
        $ActivateScript = Join-Path $VenvPath "Scripts\Activate.ps1"
        
        if (-not (Test-Path $ActivateScript)) {
            throw "Virtual environment activation script not found at: $ActivateScript"
        }
        
        Write-ColorOutput "Activating virtual environment..." $InfoColor
        
        try {
            # Activate venv
            & $ActivateScript
            
            Write-ColorOutput "[OK] Virtual environment activated" $SuccessColor
            
            # Upgrade pip
            Write-ColorOutput "Upgrading pip..." $InfoColor
            & python -m pip install --upgrade pip
            
            if ($LASTEXITCODE -ne 0) {
                Write-ColorOutput "[WARNING] Warning: Failed to upgrade pip, continuing anyway..." $WarningColor
            } else {
                Write-ColorOutput "[OK] Pip upgraded successfully" $SuccessColor
            }
            
            # Check if requirements.txt exists
            $RequirementsPath = Join-Path $BackendPath "requirements.txt"
            if (-not (Test-Path $RequirementsPath)) {
                throw "requirements.txt not found at: $RequirementsPath"
            }
            
            Write-ColorOutput "Installing requirements from requirements.txt..." $InfoColor
            & pip install -r requirements.txt
            
            if ($LASTEXITCODE -ne 0) {
                throw "Failed to install requirements"
            }
            
            Write-ColorOutput "[OK] All requirements installed successfully" $SuccessColor
            
        } catch {
            Write-ColorOutput "[ERROR] Error during requirements installation: $_" $ErrorColor
            throw
        }

        # Step 3: Generate Prisma Client
        Write-Section "Step 3: Generating Prisma Client"
        
        try {
            $PrismaSchemaPath = Join-Path $BackendPath "prisma\schema.prisma"
            
            if (-not (Test-Path $PrismaSchemaPath)) {
                throw "Prisma schema not found at: $PrismaSchemaPath"
            }
            
            Write-ColorOutput "Running prisma generate..." $InfoColor
            & prisma generate
            
            if ($LASTEXITCODE -ne 0) {
                throw "Prisma generate failed"
            }
            
            Write-ColorOutput "[OK] Prisma client generated successfully" $SuccessColor
            
        } catch {
            Write-ColorOutput "[ERROR] Error generating Prisma client: $_" $ErrorColor
            Write-ColorOutput "This might be due to missing Prisma CLI. Installing..." $WarningColor
            
            try {
                & pip install prisma
                & prisma generate
                
                if ($LASTEXITCODE -ne 0) {
                    throw "Prisma generate failed after reinstall"
                }
                
                Write-ColorOutput "[OK] Prisma client generated successfully" $SuccessColor
            } catch {
                Write-ColorOutput "[ERROR] Failed to generate Prisma client: $_" $ErrorColor
                throw
            }
        }

        # Step 4: Check Environment Variables
        Write-Section "Step 4: Checking Environment Variables"
        
        try {
            $EnvPath = Join-Path $BackendPath ".env"
            
            if (-not (Test-Path $EnvPath)) {
                Write-ColorOutput "[WARNING] Warning: .env file not found at: $EnvPath" $WarningColor
                Write-ColorOutput "Please create a .env file with DATABASE_URL and other required variables" $WarningColor
            } else {
                Write-ColorOutput "[OK] .env file found" $SuccessColor
                
                # Check for required variables
                $EnvContent = Get-Content $EnvPath -Raw
                
                $RequiredVars = @("DATABASE_URL", "GEMINI_API_KEY")
                $MissingVars = @()
                
                foreach ($Var in $RequiredVars) {
                    if ($EnvContent -notmatch "$Var\s*=") {
                        $MissingVars += $Var
                    }
                }
                
                if ($MissingVars.Count -gt 0) {
                    Write-ColorOutput "[WARNING] Warning: Missing environment variables: $($MissingVars -join ', ')" $WarningColor
                } else {
                    Write-ColorOutput "[OK] All required environment variables are present" $SuccessColor
                }
            }
            
        } catch {
            Write-ColorOutput "[WARNING] Warning: Error checking environment variables: $_" $WarningColor
        }

        # Step 5: Test Database Connection
        Write-Section "Step 5: Testing Database Connection"
        
        try {
            # Create a test script
            $TestScript = @"
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from prisma import Prisma
    import asyncio
    
    async def test_connection():
        db = Prisma()
        await db.connect()
        print("[OK] Database connection successful")
        await db.disconnect()
        return True
    
    # Run the async function
    asyncio.run(test_connection())
    sys.exit(0)
    
except ImportError as e:
    print(f"[ERROR] Import error: {e}")
    print("Make sure all dependencies are installed")
    sys.exit(1)
    
except Exception as e:
    print(f"[ERROR] Database connection failed: {e}")
    print("Please check your DATABASE_URL in .env file")
    sys.exit(1)
"@
            
            $TestScriptPath = Join-Path $BackendPath "test_db_connection.py"
            Set-Content -Path $TestScriptPath -Value $TestScript
            
            Write-ColorOutput "Testing database connection..." $InfoColor
            & python $TestScriptPath
            
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "[OK] Database connection test passed" $SuccessColor
            } else {
                Write-ColorOutput "[ERROR] Database connection test failed" $ErrorColor
                Write-ColorOutput "Please verify your DATABASE_URL in the .env file" $WarningColor
            }
            
            # Clean up test script
            Remove-Item $TestScriptPath -ErrorAction SilentlyContinue
            
        } catch {
            Write-ColorOutput "[ERROR] Error testing database connection: $_" $ErrorColor
            Write-ColorOutput "Please manually verify your database connection" $WarningColor
        }

        # Step 6: Run Prisma DB Push (Optional)
        Write-Section "Step 6: Database Schema Sync"
        
        Write-ColorOutput "Do you want to sync the database schema? (Y/N)" $WarningColor
        $Response = Read-Host
        
        if ($Response -eq 'Y' -or $Response -eq 'y') {
            try {
                Write-ColorOutput "Running prisma db push..." $InfoColor
                & prisma db push
                
                if ($LASTEXITCODE -ne 0) {
                    throw "Prisma db push failed"
                }
                
                Write-ColorOutput "[OK] Database schema synced successfully" $SuccessColor
            } catch {
                Write-ColorOutput "[ERROR] Error syncing database schema: $_" $ErrorColor
                Write-ColorOutput "You can manually run 'prisma db push' later" $WarningColor
            }
        } else {
            Write-ColorOutput "[SKIP] Skipping database schema sync" $InfoColor
            Write-ColorOutput "You can run 'prisma db push' manually when needed" $InfoColor
        }

        # Final Summary
        Write-Section "Setup Complete!"
        
        Write-ColorOutput "[OK] Backend setup completed successfully!" $SuccessColor
        Write-Host ""
        Write-ColorOutput "Next Steps:" $InfoColor
        Write-ColorOutput "1. Activate the virtual environment: .\venv\Scripts\Activate.ps1" $InfoColor
        Write-ColorOutput "2. Run the backend server: python -m uvicorn main:app --reload" $InfoColor
        Write-ColorOutput "3. Access API docs at: http://localhost:8000/docs" $InfoColor
        Write-Host ""
        
    } catch {
        Write-Section "Setup Failed"
        Write-ColorOutput "[ERROR] Backend setup failed with error:" $ErrorColor
        Write-ColorOutput $_.Exception.Message $ErrorColor
        Write-ColorOutput $_.ScriptStackTrace $ErrorColor
        exit 1
    }
}

# Run the setup
Setup-Backend
