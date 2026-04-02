# Smart Complaint Classification System

A full-stack application built with **Spring Boot** and **React** that automatically classifies civic complaints using keyword-based AI logic and assigns them to the appropriate government departments.

## 🚀 Quick Start (Windows)
1. Double-click the **`start_all.bat`** script in the root folder.
2. Wait for both servers to initialize.
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Docker Deployment
1. Ensure **Docker Desktop** is running.
2. Run `docker-compose up -d --build` in the root folder.
3. Access the UI at `http://localhost:3000`.

## 📝 Demo Login
- **Email**: `demo@example.com`
- **Password**: `pass123`

## 🌐 Render Deployment
The project is configured for easy deployment on **Render**.

### 1. Backend (Spring Boot)
- **Environment Variable**: `SPRING_PROFILES_ACTIVE=prod`
- **Port**: 8081
- **CORS Config**: The backend [CorsConfig.java](file:///c:/Users/vamsh/OneDrive/Desktop/complaint/backend/src/main/java/com/complaint/system/config/CorsConfig.java) is pre-configured to allow the Render frontend.

### 2. Frontend (React)
- **Build Command**: `npm run build`
- **Auto-Detection**: The frontend [api.js](file:///c:/Users/vamsh/OneDrive/Desktop/complaint/frontend/src/api.js) automatically identifies your Render backend URL.
- **Manual Overwrite**: Set `REACT_APP_API_URL` to your backend URL in Render if needed.

## ✨ Features
- **Smart Classification**: Automatically detects categories (Water, Electricity, Roads, Sanitation, etc.) from complaint text.
- **Auto-Assignment**: Maps categories to specific departments (e.g., Water Supply Board, PWD).
- **Dashboard**: Track complaint status (Pending, In Progress, Resolved) in real-time.
- **⚡ Simulate Action**: Demo feature to quickly transition complaint statuses.
- **Docker Ready**: Includes `Dockerfile` and `docker-compose.yml` for containerized deployment.
- **Glassmorphic UI**: Modern, responsive design with dark mode aesthetics.

## 🛠️ Tech Stack
- **Frontend**: React.js, Axios, Vanilla CSS (Modern Design)
- **Backend**: Spring Boot 3.2, Spring Data JPA, H2 Database
- **Build Tool**: Apache Maven (Local binary included)

## 📂 Project Structure
- `/backend`: Spring Boot REST API
- `/frontend`: React.js Application
- `start_all.bat`: Shortcut script to start both servers

## ⚙️ Configuration
- **Backend Port**: 8081
- **Frontend Port**: 3000
- **H2 Console**: [http://localhost:8081/h2-console](http://localhost:8081/h2-console)
  - **JDBC URL**: `jdbc:h2:mem:complaintdb`
  - **Username**: `sa`

---
*Powered by Spring Boot + React · Designed by Antigravity*
