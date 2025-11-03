# Redis Setup Script for Windows - TMS Development
# This script helps you set up Redis for the bulk upload functionality

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "TMS Bulk Upload - Redis Setup Helper" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Redis is REQUIRED for the bulk upload functionality to work." -ForegroundColor Yellow
Write-Host "The Bull job queue system depends on Redis for processing uploads." -ForegroundColor Yellow
Write-Host ""

Write-Host "OPTION 1: Memurai (Recommended for Windows Development)" -ForegroundColor Green
Write-Host "  - Free Redis-compatible server for Windows"
Write-Host "  - Runs as Windows service"
Write-Host "  - Download: https://www.memurai.com/"
Write-Host ""

Write-Host "OPTION 2: Docker Desktop" -ForegroundColor Green
Write-Host "  - Install Docker Desktop for Windows"
Write-Host "  - Run: docker run -d --name redis-tms -p 6379:6379 redis:alpine"
Write-Host ""

Write-Host "OPTION 3: WSL2 (Windows Subsystem for Linux)" -ForegroundColor Green
Write-Host "  - Install WSL2: wsl --install"
Write-Host "  - Install Redis in WSL: sudo apt install redis-server"
Write-Host "  - Start Redis: sudo service redis-server start"
Write-Host ""

Write-Host "OPTION 4: Redis Cloud (Free Tier)" -ForegroundColor Green
Write-Host "  - Sign up: https://redis.com/try-free/"
Write-Host "  - Get connection details and update backend .env file"
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Testing Redis Connection" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Memurai is installed
$memuariPath = "C:\Program Files\Memurai\redis-cli.exe"
if (Test-Path $memuariPath) {
    Write-Host "✅ Memurai found at: $memuariPath" -ForegroundColor Green
    
    # Check if service is running
    $service = Get-Service -Name "Memurai" -ErrorAction SilentlyContinue
    if ($service) {
        if ($service.Status -eq "Running") {
            Write-Host "✅ Memurai service is RUNNING" -ForegroundColor Green
            
            # Test connection
            Write-Host "Testing connection..." -ForegroundColor Yellow
            $result = & $memuariPath ping 2>&1
            if ($result -match "PONG") {
                Write-Host "✅ Redis is working! Connection successful!" -ForegroundColor Green
                Write-Host ""
                Write-Host "You're ready to test the bulk upload functionality!" -ForegroundColor Green
                Write-Host "Next step: Start the backend server and upload test files" -ForegroundColor Cyan
            } else {
                Write-Host "❌ Redis ping failed: $result" -ForegroundColor Red
            }
        } else {
            Write-Host "⚠️  Memurai service is NOT running (Status: $($service.Status))" -ForegroundColor Yellow
            Write-Host "Starting Memurai service..." -ForegroundColor Yellow
            try {
                Start-Service Memurai
                Write-Host "✅ Memurai service started successfully!" -ForegroundColor Green
            } catch {
                Write-Host "❌ Failed to start Memurai service: $_" -ForegroundColor Red
                Write-Host "Try running this script as Administrator" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "⚠️  Memurai executable found but service not installed" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Memurai not found" -ForegroundColor Red
    Write-Host ""
    
    # Check for WSL
    $wslCheck = wsl --list --quiet 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ WSL is installed" -ForegroundColor Green
        Write-Host "Testing Redis in WSL..." -ForegroundColor Yellow
        
        $redisTest = wsl redis-cli ping 2>&1
        if ($redisTest -match "PONG") {
            Write-Host "✅ Redis is running in WSL!" -ForegroundColor Green
            Write-Host ""
            Write-Host "IMPORTANT: Update your backend .env file:" -ForegroundColor Yellow
            Write-Host "REDIS_HOST=localhost" -ForegroundColor Cyan
            Write-Host "REDIS_PORT=6379" -ForegroundColor Cyan
        } elseif ($redisTest -match "command not found") {
            Write-Host "⚠️  Redis not installed in WSL" -ForegroundColor Yellow
            Write-Host "Install with: wsl sudo apt update && wsl sudo apt install redis-server" -ForegroundColor Cyan
        } elseif ($redisTest -match "Could not connect") {
            Write-Host "⚠️  Redis installed but not running in WSL" -ForegroundColor Yellow
            Write-Host "Start with: wsl sudo service redis-server start" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Redis test failed: $redisTest" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ WSL not installed" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Red
    Write-Host "REDIS NOT READY" -ForegroundColor Red
    Write-Host "=========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Redis using one of the options above before testing." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "QUICKEST OPTION: Install Memurai" -ForegroundColor Green
    Write-Host "1. Download from: https://www.memurai.com/" -ForegroundColor Cyan
    Write-Host "2. Run installer" -ForegroundColor Cyan
    Write-Host "3. Run this script again to verify" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Need Help?" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "See PHASE_5_TESTING_GUIDE.md for detailed Redis installation instructions" -ForegroundColor Yellow
Write-Host ""
