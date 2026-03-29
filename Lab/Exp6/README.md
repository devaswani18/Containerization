# 🧪 Experiment 6
# Comparison of Docker Run vs Docker Compose | Multi-Stage Build | Networking

---

## 🎯 Aim

To study and implement:

- Docker container execution using `docker run`
- Multi-container orchestration using `docker compose`
- Docker networking
- Port mapping and environment variables
- WordPress + MySQL setup using Docker
- Multi-stage Docker builds
- Troubleshooting Docker errors

---

## 🧩 Part 1 – Running Nginx Using Docker Run

### 🔹 Command

```bash
docker run -d \
  --name my-nginx \
  -p 8080:80 \
  -v ./html:/usr/share/nginx/html \
  -e NGINX_HOST=localhost \
  --restart unless-stopped \
  nginx:alpine
```

### 🔹 Verify Container & Test Using Curl

```bash
docker ps
curl localhost:8080
```

![ ](../Screenshots/Exp6/28a.png)

---

### 🔹 Stop & Remove Container

```bash
docker stop my-nginx
docker rm my-nginx
```

---

## 🧩 Part 2 – Using Docker Compose

### 🔹 docker-compose.yml

```yaml
services:
  nginx:
    image: nginx:alpine
    container_name: my-nginx
    ports:
      - "8080:80"
```

### 🔹 Run, Verify & Stop Compose

```bash
docker compose up -d
docker compose ps
docker compose down
```

![ ](../Screenshots/Exp6/28b.png)

---

## 🧩 Part 3 – WordPress + MySQL Using Docker Network

### 🔹 Create Network

```bash
docker network create wp-net
```

### 🔹 Run MySQL Container

```bash
docker run -d \
  --name mysql \
  --network wp-net \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=wordpress \
  mysql:5.7
```

### 🔹 Run WordPress Container

```bash
docker run -d \
  --name wordpress \
  --network wp-net \
  -p 8090:80 \
  -e WORDPRESS_DB_HOST=mysql \
  -e WORDPRESS_DB_PASSWORD=secret \
  wordpress:latest
```

```bash
curl http://localhost:8090
```

![ ](../Screenshots/Exp6/28c.png)

---

### 🔹 WordPress + MySQL via Docker Compose

```bash
docker compose up -d
docker compose down -v
```

![ ](../Screenshots/Exp6/28d.png)

---

## 🧩 Part 4 – Multi-Stage Dockerfile (Advanced Node App)

### 🔹 Fixing Docker Credential Error & Pulling Image

```bash
rm -rf ~/.docker
docker pull node:18-alpine
docker compose up -d
```

![ ](../Screenshots/Exp6/28e.png)

---

### 🔹 Python + PostgreSQL Backend via Compose

```bash
docker compose up -d
docker compose down -v
docker compose down --remove-orphans
docker compose up -d --build
```

![ ](../Screenshots/Exp6/28f.png)

---

### 🔹 Dockerfile (Multi-Stage)

```dockerfile
# Stage 1 – Builder
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

# Stage 2 – Production
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app /app

ENV PORT=3000
ENV APP_MODE=production

EXPOSE 3000

CMD ["node", "app.js"]
```

### 🔹 Build and Run Using Compose

```bash
docker compose up -d --build
docker compose ps
docker images
```

![ ](../Screenshots/Exp6/28g.png)

---

### 🔹 Build exp6-nodeapp & exp6-advanced-app

```bash
docker compose up --build -d
curl localhost:3000
```

![ ](../Screenshots/Exp6/28h.png)

---

### 🔹 Rebuild & Verify Advanced App

```bash
docker compose up --build -d
curl localhost:3000
docker ps
```

![ ](../Screenshots/Exp6/28i.png)

---

### 🔹 Multi-Stage Dockerfile with Compose

Requirements:
- Multi-stage Dockerfile
- Smaller final image
- Use `build:` in Compose
- Add environment variables
- Add volume mount for development mode
- Compare image size: `docker images`

```bash
docker compose up --build -d
docker ps
```

![ ](../Screenshots/Exp6/28j.png)

---

### 🔹 Verify Application in Production Mode

```bash
curl localhost:3001
```

![ ](../Screenshots/Exp6/28k.png)

---

## 🧠 Difference Between Docker Run & Docker Compose

| Feature | Docker Run | Docker Compose |
|---|---|---|
| Configuration | CLI-based | YAML file |
| Multiple Containers | Manual | Automatic |
| Networking | Manual setup | Auto-created |
| Scalability | Difficult | Easy |
| Maintainability | Low | High |
| Production Ready | Limited | Yes |

---

## 🚀 Concepts Covered

- Containerization
- Port Mapping (`-p host:container`)
- Volume Mounting (`-v`)
- Environment Variables (`-e`)
- Docker Networks
- Restart Policies
- Orphan Containers
- Multi-stage Build Optimization
- Layer Caching

---

## ❗ Errors Faced & Solutions

### 1️⃣ Port Already Allocated
**Error:** `Bind for 0.0.0.0 failed`  
**Solution:** Stop existing container or change host port.

---

### 2️⃣ Container Name Conflict
**Error:** Container name already in use  
**Solution:**
```bash
docker rm -f <container-name>
```

---

### 3️⃣ Docker Credential Error
**Error:** `error getting credentials – err: exit status 1`  
**Solution:**
```bash
rm -rf ~/.docker
docker pull node:18-alpine
```

---

### 4️⃣ Orphan Containers Warning
**Solution:**
```bash
docker compose down --remove-orphans
```

---

### 5️⃣ Database Connection Error (WordPress)
**Solution:** Ensure MySQL and WordPress are on the same Docker network (`wp-net`).

---

## 🏁 Result

Successfully implemented:

- ✅ Nginx container using Docker Run with port mapping and volume
- ✅ Docker Compose orchestration (network + container lifecycle)
- ✅ WordPress + MySQL multi-container networking on `wp-net`
- ✅ Multi-stage Node.js builds (`exp6-nodeapp`, `exp6-advanced-app`)
- ✅ `curl localhost:3001` → **"Running in production mode 🚀"**
- ✅ Port conflict and credential error resolution
- ✅ Orphan container cleanup with `--remove-orphans`

---

## 📌 Conclusion

This experiment provided hands-on experience in:

- Managing containers using CLI and Compose
- Building optimized Docker images with multi-stage builds
- Implementing multi-container architecture with custom networks
- Handling production-level Docker errors
- Understanding networking, volumes, and environment configurations

The practical exposure enhanced understanding of container orchestration and deployment workflows.

---

## 📚 References

- [Docker Official Documentation](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Docker Networking](https://docs.docker.com/network/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
