@echo off
echo Starting server...
cd server
start /b npm run start:dev
cd ..

echo Waiting for server to start...
timeout /t 5 /nobreak > nul

echo Testing API...
node test-user-role.js

pause 