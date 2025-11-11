@echo off
echo Starting Memurai service...
net start Memurai
echo.
echo Memurai status:
sc query Memurai
echo.
pause