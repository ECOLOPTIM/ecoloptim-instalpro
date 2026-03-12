@echo off
REM =============================================================
REM Ecoloptim InstalPro — Script de pornire (Windows)
REM Dublu-click pe acest fisier sau ruleaza din Command Prompt
REM =============================================================

title Ecoloptim InstalPro - Pornire

echo.
echo ============================================
echo    Ecoloptim InstalPro -- Pornire aplicatie
echo ============================================
REM (aplicatie = aplicație)
echo.

REM ── 1. Verifica Docker ──────────────────────────────────────
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [EROARE] Docker nu este instalat!
    echo.
    echo Instaleaza Docker Desktop de la:
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [EROARE] Docker nu ruleaza!
    echo.
    echo Porneste Docker Desktop si incearca din nou.
    echo.
    pause
    exit /b 1
)

echo [OK] Docker este disponibil

REM ── 2. Verifica docker compose ──────────────────────────────
docker compose version >nul 2>&1
if %errorlevel% equ 0 (
    set COMPOSE_CMD=docker compose
) else (
    where docker-compose >nul 2>&1
    if %errorlevel% equ 0 (
        set COMPOSE_CMD=docker-compose
    ) else (
        echo [EROARE] Docker Compose nu este disponibil!
        echo Instaleaza Docker Desktop de la: https://www.docker.com/products/docker-desktop
        pause
        exit /b 1
    )
)

echo [OK] Docker Compose disponibil
echo.

REM ── 3. Porneste serviciile ───────────────────────────────────
echo [PORNIRE] Construiesc si pornesc serviciile...
echo (Primul start poate dura cateva minute)
echo.
%COMPOSE_CMD% up -d --build

if %errorlevel% neq 0 (
    echo.
    echo [EROARE] Nu am putut porni serviciile!
    echo Verifica log-urile cu: %COMPOSE_CMD% logs
    pause
    exit /b 1
)

REM ── 4. Asteapta serviciile ───────────────────────────────────
echo.
echo Astept ca serviciile sa fie pregatite...
timeout /t 15 /nobreak >nul

REM ── 5. Afiseaza informatii ───────────────────────────────────
echo.
echo ============================================
echo  Aplicatia este gata!
echo ============================================
echo.
echo  Frontend:    http://localhost
echo  Backend API: http://localhost:5000/api/health
echo.
echo  Credentiale implicite:
echo    Username: admin
echo    Parola:   admin123
echo.
echo  IMPORTANT: Schimba parola dupa primul login!
echo  Mergi la: Setari ^> Schimbare Parola
echo.
echo ============================================
echo Alte comenzi utile:
echo   Vezi log-uri:  %COMPOSE_CMD% logs -f
echo   Opreste app:   %COMPOSE_CMD% down
echo   Reseteaza DB:  %COMPOSE_CMD% down -v ^&^& %COMPOSE_CMD% up -d
echo ============================================
echo.

REM Deschide browser-ul automat
start "" http://localhost

pause
