# Containerized Task Manager with PostgreSQL using Docker Compose and IPVLAN

## Overview

This project demonstrates a **containerized full-stack Task Manager application** using Docker.
It includes a **frontend (Nginx), backend API (Node.js + Express), and PostgreSQL database**, orchestrated with **Docker Compose** and connected through an **IPVLAN network**.

The project also demonstrates **Docker image optimization techniques**, comparing:

- Optimized build (Alpine + Multi-stage)
- Non-optimized build (Standard images)

---

## Architecture

```
Client Browser
      │
      ▼
Frontend Container (Nginx) — frontend_ui
localhost:8080
      │
      ▼
Backend API Container (Node.js + Express) — backend_api
      │
      ▼
PostgreSQL Container — postgres_db
```

All services communicate through a custom **IPVLAN network (`mynet`)**.

---

## Project Structure

```
assignment/
│
├── backend/
│   ├── Dockerfile
│   ├── server.js
│   ├── package.json
│   └── .dockerignore
│
├── database/
│   ├── Dockerfile
│   └── init.sql
│
├── frontend/
│   ├── Dockerfile
│   └── index.html
│
└── docker-compose.yml
```

---

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML + Nginx |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Containerization | Docker |
| Orchestration | Docker Compose |
| Networking | IPVLAN |

---

## Docker Image Optimization

### Optimized Build
- Alpine base images
- Multi-stage builds
- Non-root user
- Minimal layers

### Non-Optimized Build
- Standard images
- Single stage builds
- Larger image sizes

---

## Create Network (Required)

Create IPVLAN network manually:

```bash
docker network create -d ipvlan \
  --subnet=172.24.0.0/16 \
  --gateway=172.24.0.1 \
  -o parent=eth0 \
  mynet
```

Verify:

```bash
docker network inspect mynet
```

![ ](images/net.png)

---

## Build and Run the Application

### Build Containers

```bash
docker compose build
```

### Start Containers

```bash
docker compose up -d
```

### Check Running Containers

```bash
docker ps
```

![ ](images/dockerPs.png)

---

## Container Details

| Service | Container Name | Port |
|---|---|---|
| Frontend | frontend_ui | 8080:80 |
| Backend | backend_api | — |
| Database | postgres_db | — |

---

## Application Usage

Open the frontend in a browser:

```
http://localhost:8080
```

The **Task Manager** interface allows users to:

- Add new task records (Title + Status)
- View stored task records
- Refresh to fetch latest data from backend

![ ](images/Frontend_UI.png)

---

## Adding Data Through Frontend

Steps:

1. Open `http://localhost:8080`
2. Enter **Task name** (e.g. `assignment`) and **Status** (e.g. `pending`) in the input fields
3. Click **Add Task**
4. The request is sent to the backend API
5. The backend stores the data in the PostgreSQL database

---

## Volume Persistence Test

Check volumes:

```bash
docker volume ls
```

![ ](images/vol.png)

---

Enter data through frontend (task: `assignment - pending`):

![ ](images/BeforeDown.png)

---

Stop containers:

```bash
docker compose down
```

Restart:

```bash
docker compose up -d
```

![ ](images/down.png)

---

Verify previously inserted data still exists after restart:

![ ](images/AfterDown.png)

---

## Image Size Comparison

```bash
docker images
```

![ ](images/size.png)

| Repository | Tag | Size |
|---|---|---|
| assignment-frontend | latest | 92.5MB |
| assignment-backend | latest | 187MB |
| assignment-database | latest | 392MB |

---

## macvlan vs ipvlan Comparison

| Feature | Macvlan | Ipvlan |
|---|---|---|
| MAC Address | Unique per container | Shared |
| Host communication | Not allowed | Allowed |
| Performance | Good | Better |
| Use case | LAN device simulation | Virtualized environments |

IPVLAN was selected due to compatibility with virtualized environments like **WSL2**.

---

## Key Concepts Demonstrated

- Docker multi-stage builds
- Container networking with IPVLAN
- Static IP assignment
- Docker Compose orchestration
- Persistent storage using volumes
- Image optimization techniques (Alpine vs Standard)

---

## Result

Successfully implemented:

- ✅ Built 3 images: `assignment-frontend`, `assignment-backend`, `assignment-database`
- ✅ All containers running via `docker compose up -d`
- ✅ Task Manager accessible at `http://localhost:8080`
- ✅ Task data persisted after `docker compose down` and restart
- ✅ IPVLAN network `mynet` created with subnet `172.24.0.0/16`
- ✅ Image size comparison: Alpine (16MB) vs standard nginx (240MB)

---

## Author
Dev Aswani
B.Tech – Containerization and DevOps
