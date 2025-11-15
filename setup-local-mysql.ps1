# Local MySQL Setup Script
# Run this to set up local MySQL database for development

Write-Host "🚀 TMS Backend - Local MySQL Setup" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if MySQL is installed
Write-Host "📋 Checking MySQL installation..." -ForegroundColor Yellow
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue

if (-not $mysqlPath) {
    Write-Host "❌ MySQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "`n💡 Please install MySQL:" -ForegroundColor Yellow
    Write-Host "   1. Download from: https://dev.mysql.com/downloads/mysql/" -ForegroundColor White
    Write-Host "   2. Or use XAMPP: https://www.apachefriends.org/" -ForegroundColor White
    Write-Host "   3. Or use MySQL Workbench: https://dev.mysql.com/downloads/workbench/" -ForegroundColor White
    exit 1
}

Write-Host "✅ MySQL found at: $($mysqlPath.Source)" -ForegroundColor Green

# Check if MySQL service is running
Write-Host "`n📋 Checking MySQL service status..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($mysqlService) {
    if ($mysqlService.Status -eq "Running") {
        Write-Host "✅ MySQL service is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MySQL service is stopped. Attempting to start..." -ForegroundColor Yellow
        try {
            Start-Service $mysqlService.Name
            Write-Host "✅ MySQL service started successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to start MySQL service: $_" -ForegroundColor Red
            Write-Host "   Please start MySQL manually" -ForegroundColor Yellow
            exit 1
        }
    }
} else {
    Write-Host "⚠️  MySQL service not found. It might be XAMPP or custom installation." -ForegroundColor Yellow
}

# Prompt for MySQL root password
Write-Host "`n🔐 Enter MySQL root password (leave empty if no password):" -ForegroundColor Yellow
$securePassword = Read-Host -AsSecureString
$password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

# Test MySQL connection
Write-Host "`n📋 Testing MySQL connection..." -ForegroundColor Yellow
$testQuery = "SELECT VERSION();"

if ($password) {
    $testConnection = mysql -u root -p$password -e $testQuery 2>&1
} else {
    $testConnection = mysql -u root -e $testQuery 2>&1
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ MySQL connection successful!" -ForegroundColor Green
    Write-Host "   MySQL Version: $testConnection" -ForegroundColor White
} else {
    Write-Host "❌ MySQL connection failed" -ForegroundColor Red
    Write-Host "   Error: $testConnection" -ForegroundColor Red
    Write-Host "`n💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check if password is correct" -ForegroundColor White
    Write-Host "   2. Ensure MySQL is running on port 3306" -ForegroundColor White
    Write-Host "   3. Try: mysql -u root -p" -ForegroundColor White
    exit 1
}

# Create database
Write-Host "`n📋 Creating 'tms_dev' database..." -ForegroundColor Yellow
$createDbQuery = "CREATE DATABASE IF NOT EXISTS tms_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if ($password) {
    mysql -u root -p$password -e $createDbQuery 2>&1 | Out-Null
} else {
    mysql -u root -e $createDbQuery 2>&1 | Out-Null
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database 'tms_dev' created successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database creation failed (it might already exist)" -ForegroundColor Yellow
}

# Show databases
Write-Host "`n📋 Available databases:" -ForegroundColor Yellow
if ($password) {
    mysql -u root -p$password -e "SHOW DATABASES;" 2>&1
} else {
    mysql -u root -e "SHOW DATABASES;" 2>&1
}

# Update .env file with password
Write-Host "`n📋 Updating .env file..." -ForegroundColor Yellow
$envPath = "d:\tms developement 11 nov\Maventic.TMS\tms-backend\.env"

if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    # Update DB_PASSWORD line
    if ($password) {
        $envContent = $envContent -replace 'DB_PASSWORD=.*', "DB_PASSWORD=$password"
    } else {
        $envContent = $envContent -replace 'DB_PASSWORD=.*', 'DB_PASSWORD='
    }
    
    Set-Content -Path $envPath -Value $envContent
    Write-Host "✅ .env file updated with database credentials" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found at: $envPath" -ForegroundColor Yellow
}

# Run migrations
Write-Host "`n📋 Running database migrations..." -ForegroundColor Yellow
Set-Location "d:\tms developement 11 nov\Maventic.TMS\tms-backend"

try {
    npx knex migrate:latest
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migrations completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Some migrations failed (check error above)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Migration error: $_" -ForegroundColor Yellow
}

# Run seeds (optional)
Write-Host "`n📋 Do you want to seed the database with test data? (Y/N):" -ForegroundColor Yellow
$seedChoice = Read-Host

if ($seedChoice -eq "Y" -or $seedChoice -eq "y") {
    Write-Host "`n📋 Running database seeds..." -ForegroundColor Yellow
    try {
        npx knex seed:run
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Seeds completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Some seeds failed (check error above)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Seed error: $_" -ForegroundColor Yellow
    }
}

# Final summary
Write-Host "`n" -ForegroundColor White
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ LOCAL MYSQL SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "`n📊 Configuration:" -ForegroundColor Yellow
Write-Host "   Host: localhost" -ForegroundColor White
Write-Host "   Port: 3306" -ForegroundColor White
Write-Host "   User: root" -ForegroundColor White
Write-Host "   Database: tms_dev" -ForegroundColor White
Write-Host "`n🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Start backend: cd tms-backend && npm start" -ForegroundColor White
Write-Host "   2. Start frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "   3. Open browser: http://localhost:5173" -ForegroundColor White
Write-Host "`n💡 Troubleshooting:" -ForegroundColor Yellow
Write-Host "   - If backend fails, check backend/.env file" -ForegroundColor White
Write-Host "   - Ensure MySQL is running: sc query MySQL80" -ForegroundColor White
Write-Host "   - Test connection: mysql -u root -p" -ForegroundColor White
Write-Host "`n" -ForegroundColor White
