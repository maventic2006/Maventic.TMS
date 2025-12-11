@echo off
echo ==========================================
echo Building Frontend for Testing Server
echo Target: 192.168.2.32:5000
echo ==========================================

REM Copy testing environment file
echo Copying .env.testing to .env...
copy /Y .env.testing .env

REM Build the project
echo Building project...
npm run build

echo ==========================================
echo Build Complete!
echo ==========================================
echo Deploy the 'dist' folder to testing server
echo ==========================================
pause
