@echo off
echo Starting database, database admin, and mail server...
docker-compose up -d

echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

:check_services
echo Checking service availability...

set db_ready=0
set mail_ready=0
set db_admin_ready=0

echo Checking database connectivity...
docker-compose exec db pg_isready -U postgres >nul 2>&1
if %errorlevel% == 0 (
    echo Database is ready!
    set db_ready=1
) else (
    echo Database is not ready yet...
)

echo Checking mail server connectivity...
curl -f http://localhost:8026 >nul 2>&1
if %errorlevel% == 0 (
    echo Mail server is ready!
    set mail_ready=1
) else (
    echo Mail server is not ready yet...
)

echo Checking database admin panel connectivity...
curl -f http://localhost:8080 >nul 2>&1
if %errorlevel% == 0 (
    echo Database admin panel is ready!
    set db_admin_ready=1
) else (
    echo Database admin panel is not ready yet...
)

if %db_ready% == 1 if %mail_ready% == 1 if %db_admin_ready% == 1 (
    echo All services are ready!
    goto :services_ready
)

echo Some services are still starting, waiting 5 seconds...
timeout /t 5 /nobreak >nul
goto :check_services

:services_ready
echo.
echo All services started successfully!
echo Database is running on localhost:5433
echo Database Admin Panel is running on http://localhost:8080
echo Mail server is running on localhost:1026 (SMTP) and http://localhost:8026 (Web UI)
echo.
echo You can now start your NestJS application.