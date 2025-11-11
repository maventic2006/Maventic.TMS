# Kill Process on Port 5000
# This script forcefully terminates any process using port 5000

param(
    [int]$Port = 5000
)

Write-Host "🔍 Checking for processes using port $Port..." -ForegroundColor Cyan

# Find process using the port
$connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

if ($connection) {
    $processId = $connection.OwningProcess
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Host "⚠️  Found process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Yellow
        Write-Host "🔪 Killing process..." -ForegroundColor Red
        
        try {
            Stop-Process -Id $processId -Force
            Write-Host "✅ Successfully killed process on port $Port" -ForegroundColor Green
            Start-Sleep -Seconds 1
        } catch {
            Write-Host "❌ Failed to kill process: $_" -ForegroundColor Red
            exit 1
        }
    }
} else {
    Write-Host "✅ Port $Port is free" -ForegroundColor Green
}

exit 0
