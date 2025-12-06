@echo off
echo ==========================================
echo Setting up Pawn System...
echo ==========================================

cd pawn-system

echo.
echo [0/3] Configuring environment...
echo DATABASE_URL="file:./dev.db" > .env

echo.
echo [1/3] Installing dependencies (this may take a moment)...
call npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Setting up database...
echo Running prisma generate...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Error generating Prisma client.
    pause
    exit /b %errorlevel%
)

echo Running prisma db push...
call npx prisma db push
if %errorlevel% neq 0 (
    echo Error pushing database schema.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Starting development server...
echo.
echo You can access the app at http://localhost:3000
echo.
npm run dev

pause
