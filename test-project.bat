@echo off
title Kishore Kumar Mart - Test Suite
set "PATH=C:\Users\welcome\tools\node;C:\Users\welcome\tools\git\cmd;%PATH%"
cd /d "%~dp0"
echo Running automated integration tests...
node test/api-test.js
pause
