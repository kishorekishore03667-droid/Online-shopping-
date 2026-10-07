@echo off
title Push Kishore Kumar Mart to GitHub
set "PATH=C:\Users\welcome\tools\node;C:\Users\welcome\tools\git\cmd;%PATH%"
cd /d "%~dp0"
echo ====================================================
echo  Kishore Kumar Mart - GitHub Push Wizard
echo ====================================================
echo.
echo Make sure you have created an empty repository on GitHub first.
echo (e.g. https://github.com/username/kishorekumarmart.git)
echo.
set /p REPO_URL="Enter your GitHub Repository URL: "

if "%REPO_URL%"=="" (
    echo [ERROR] No URL entered. Aborting.
    pause
    exit /b
)

echo.
echo Configuring remote repository...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main

echo.
echo Pushing project to GitHub main branch...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================
    echo [SUCCESS] Project pushed successfully to GitHub!
    echo ====================================================
) else (
    echo.
    echo [NOTE] If this is your first time connecting, please log in
    echo when the GitHub sign-in window appears.
)

pause
