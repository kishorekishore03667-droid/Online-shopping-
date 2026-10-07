@echo off
title Kishore Kumar Mart - Server
set "PATH=C:\Users\welcome\tools\node;C:\Users\welcome\tools\git\cmd;%PATH%"
cd /d "%~dp0"
echo ====================================================
echo Starting Kishore Kumar Mart Server...
echo ====================================================
node server.js
pause
