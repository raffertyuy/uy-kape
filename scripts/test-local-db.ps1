#!/usr/bin/env pwsh
# Local Database Test Script for Windows PowerShell
# Manages Supabase local development and runs tests with real database

param(
    [Parameter(Position=0)]
    [ValidateSet("setup", "start", "stop", "reset", "test", "status", "help")]
    [string]$Action = "help",
    
    [switch]$Force,
    [switch]$Verbose
)

# Script configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Project paths
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$SupabaseDir = Join-Path $ProjectRoot "supabase"
$DatabaseDir = Join-Path $ProjectRoot "database"

# Supabase local configuration
$SUPABASE_API_URL = "http://127.0.0.1:54321"
$SUPABASE_DB_PORT = 54322
$SUPABASE_STUDIO_PORT = 54323

function Write-Status {
    param([string]$Message, [string]$Level = "Info")
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    switch ($Level) {
        "Error" { Write-Host "[$timestamp] ERROR: $Message" -ForegroundColor Red }
        "Warning" { Write-Host "[$timestamp] WARN:  $Message" -ForegroundColor Yellow }
        "Success" { Write-Host "[$timestamp] OK:    $Message" -ForegroundColor Green }
        default { Write-Host "[$timestamp] INFO:  $Message" -ForegroundColor Cyan }
    }
}

function Test-SupabaseInstalled {
    try {
        $version = supabase --version 2>$null
        if ($version) {
            Write-Status "Supabase CLI is installed: $version"
            return $true
        }
    } catch {
        Write-Status "Supabase CLI is not installed or not in PATH" "Error"
        Write-Status "Install it from: https://supabase.com/docs/guides/cli" "Error"
        return $false
    }
    return $false
}

function Test-DockerRunning {
    try {
        $dockerInfo = docker info 2>$null
        if ($dockerInfo) {
            Write-Status "Docker is running"
            return $true
        }
    } catch {
        Write-Status "Docker is not running or not installed" "Error"
        Write-Status "Docker is required for Supabase local development" "Error"
        return $false
    }
    return $false
}

function Test-SupabaseRunning {
    try {
        $response = Invoke-WebRequest -Uri "$SUPABASE_API_URL/health" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Status "Supabase local instance is running"
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

function Start-SupabaseLocal {
    Write-Status "Starting Supabase local development environment..."
    
    if (-not (Test-SupabaseInstalled)) { return $false }
    if (-not (Test-DockerRunning)) { return $false }
    
    if (Test-SupabaseRunning) {
        Write-Status "Supabase is already running" "Warning"
        return $true
    }
    
    try {
        Set-Location $ProjectRoot
        Write-Status "Initializing Supabase project (if needed)..."
        if (-not (Test-Path $SupabaseDir)) {
            supabase init
        }
        
        Write-Status "Starting Supabase services..."
        supabase start
        
        # Wait for services to be ready
        $maxAttempts = 30
        $attempt = 0
        do {
            Start-Sleep -Seconds 2
            $attempt++
            Write-Status "Waiting for Supabase to be ready... ($attempt/$maxAttempts)"
        } while (-not (Test-SupabaseRunning) -and $attempt -lt $maxAttempts)
        
        if (Test-SupabaseRunning) {
            Write-Status "Supabase local environment started successfully!" "Success"
            Write-Status "API URL: $SUPABASE_API_URL"
            Write-Status "Studio URL: http://127.0.0.1:$SUPABASE_STUDIO_PORT"
            Write-Status "DB URL: postgresql://postgres:postgres@127.0.0.1:$SUPABASE_DB_PORT/postgres"
            return $true
        } else {
            Write-Status "Failed to start Supabase within timeout" "Error"
            return $false
        }
    } catch {
        Write-Status "Error starting Supabase: $($_.Exception.Message)" "Error"
        return $false
    }
}

function Stop-SupabaseLocal {
    Write-Status "Stopping Supabase local development environment..."
    
    try {
        Set-Location $ProjectRoot
        supabase stop
        Write-Status "Supabase local environment stopped" "Success"
        return $true
    } catch {
        Write-Status "Error stopping Supabase: $($_.Exception.Message)" "Error"
        return $false
    }
}

function Reset-SupabaseLocal {
    Write-Status "Resetting Supabase local database..."
    
    if ($Force -or (Read-Host "This will destroy all local data. Continue? (y/N)") -eq "y") {
        try {
            Set-Location $ProjectRoot
            supabase db reset
            Write-Status "Supabase database reset completed" "Success"
            return $true
        } catch {
            Write-Status "Error resetting database: $($_.Exception.Message)" "Error"
            return $false
        }
    } else {
        Write-Status "Database reset cancelled"
        return $false
    }
}

function Invoke-LocalDatabaseTests {
    Write-Status "Running tests with local database..."
    
    if (-not (Test-SupabaseRunning)) {
        Write-Status "Supabase is not running. Starting it first..."
        if (-not (Start-SupabaseLocal)) {
            Write-Status "Failed to start Supabase for testing" "Error"
            return $false
        }
    }
    
    try {
        Set-Location $ProjectRoot
        
        # Set environment variables for local database testing
        $env:VITE_TEST_USE_LOCAL_DB = "true"
        $env:VITE_TEST_USE_MOCKS = "false"
        $env:NODE_ENV = "test"
        
        Write-Status "Environment configured for local database testing"
        Write-Status "VITE_TEST_USE_LOCAL_DB=true"
        Write-Status "VITE_TEST_USE_MOCKS=false"
        
        # Run tests
        Write-Status "Executing test suite..."
        npm run test
        
        $exitCode = $LASTEXITCODE
        if ($exitCode -eq 0) {
            Write-Status "All tests passed!" "Success"
            return $true
        } else {
            Write-Status "Some tests failed (exit code: $exitCode)" "Error"
            return $false
        }
    } catch {
        Write-Status "Error running tests: $($_.Exception.Message)" "Error"
        return $false
    } finally {
        # Clean up environment variables
        Remove-Item Env:VITE_TEST_USE_LOCAL_DB -ErrorAction SilentlyContinue
        Remove-Item Env:VITE_TEST_USE_MOCKS -ErrorAction SilentlyContinue
    }
}

function Get-SupabaseStatus {
    Write-Status "Checking Supabase local development status..."
    
    $status = @{
        SupabaseCLI = Test-SupabaseInstalled
        Docker = Test-DockerRunning
        LocalInstance = Test-SupabaseRunning
        ProjectInitialized = Test-Path $SupabaseDir
    }
    
    Write-Host "`nStatus Report:" -ForegroundColor White
    Write-Host "=============" -ForegroundColor White
    
    foreach ($check in $status.GetEnumerator()) {
        $statusText = if ($check.Value) { "✓ OK" } else { "✗ FAIL" }
        $color = if ($check.Value) { "Green" } else { "Red" }
        Write-Host "$($check.Key.PadRight(20)): $statusText" -ForegroundColor $color
    }
    
    if ($status.LocalInstance) {
        Write-Host "`nService URLs:" -ForegroundColor White
        Write-Host "============" -ForegroundColor White
        Write-Host "API:     $SUPABASE_API_URL" -ForegroundColor Cyan
        Write-Host "Studio:  http://127.0.0.1:$SUPABASE_STUDIO_PORT" -ForegroundColor Cyan
        Write-Host "DB:      postgresql://postgres:postgres@127.0.0.1:$SUPABASE_DB_PORT/postgres" -ForegroundColor Cyan
    }
    
    return $status.LocalInstance
}

function Show-Help {
    Write-Host @"
Local Database Test Script for Uy, Kape!
=========================================

This script manages Supabase local development and testing.

USAGE:
    .\scripts\test-local-db.ps1 <action> [options]

ACTIONS:
    setup     - Install dependencies and initialize Supabase project
    start     - Start Supabase local development environment  
    stop      - Stop Supabase local development environment
    reset     - Reset the local database (destroys all data)
    test      - Run tests against local database
    status    - Check status of local development environment
    help      - Show this help message

OPTIONS:
    -Force    - Skip confirmation prompts
    -Verbose  - Show detailed output

EXAMPLES:
    .\scripts\test-local-db.ps1 start          # Start local Supabase
    .\scripts\test-local-db.ps1 test           # Run tests with local DB
    .\scripts\test-local-db.ps1 reset -Force   # Reset DB without confirmation
    .\scripts\test-local-db.ps1 status         # Check current status

PREREQUISITES:
    - Docker Desktop installed and running
    - Supabase CLI installed (see: https://supabase.com/docs/guides/cli)
    - Node.js and npm installed

"@ -ForegroundColor White
}

# Main script execution
try {
    Set-Location $ProjectRoot
    
    switch ($Action.ToLower()) {
        "setup" {
            Write-Status "Setting up local development environment..."
            if ((Start-SupabaseLocal) -and (Reset-SupabaseLocal)) {
                Write-Status "Setup completed successfully!" "Success"
                exit 0
            } else {
                exit 1
            }
        }
        "start" {
            if (Start-SupabaseLocal) {
                exit 0
            } else {
                exit 1
            }
        }
        "stop" {
            if (Stop-SupabaseLocal) {
                exit 0
            } else {
                exit 1
            }
        }
        "reset" {
            if (Reset-SupabaseLocal) {
                exit 0
            } else {
                exit 1
            }
        }
        "test" {
            if (Invoke-LocalDatabaseTests) {
                exit 0
            } else {
                exit 1
            }
        }
        "status" {
            if (Get-SupabaseStatus) {
                exit 0
            } else {
                exit 1
            }
        }
        default {
            Show-Help
            exit 0
        }
    }
} catch {
    Write-Status "Unexpected error: $($_.Exception.Message)" "Error"
    exit 1
}