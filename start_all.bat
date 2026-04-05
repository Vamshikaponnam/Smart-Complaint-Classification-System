@echo off
echo ==========================================
echo   Smart Complaint Classification System
echo ==========================================

:: Set Maven Path (Local extracted version)
set MAVEN_HOME=C:\Users\vamsh\maven\apache-maven-3.9.6
set PATH=%MAVEN_HOME%\bin;%PATH%

echo STARTING BACKEND (Spring Boot on port 8081)...
start /B "Backend" cmd /c "cd backend && java -jar target/complaint-system-0.0.1-SNAPSHOT.jar"

echo STARTING FRONTEND (React on port 3000)...
start /B "Frontend" cmd /c "cd frontend && npm start"

echo.
echo  - Frontend (LIVE): https://smart-complaint-classification-system-1.onrender.com/
echo  - Backend: http://localhost:8081
echo  - H2 Console: http://localhost:8081/h2-console
echo ==========================================
echo.
echo Both servers are starting in the background...
pause
