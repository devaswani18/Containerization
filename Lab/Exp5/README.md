# **Experiment 5: Docker - Volumes, Environment Variables, Monitoring & Networks**

## **Part 1: Docker Volumes - Persistent Data Storage**

### **Lab 1: Understanding Data Persistence**

#### **The Problem: Container Data is Ephemeral**
```bash
# Create a container that writes data
docker run -it --name test-container ubuntu /bin/bash

# Inside container:
echo "Hello World" > message.txt
cat message.txt  # Shows "Hello World"
exit

# delete and make a new container
docker stop test-container
docker rm test-container
docker run -it --name test-container ubuntu /bin/bash
cat message.txt
# ERROR: File doesn't exist! Data was lost.
```

![ ](../../Screenshots/Exp5/Screenshot%20(849).png)

> **Solution: Docker Volumes**

---

### **Lab 2: Volume Types**

#### **1. Anonymous Volumes**
```bash
# Create anonymous volume (auto-generated name)
docker run -d -v /app/data --name web1 nginx

# Check volume
docker volume ls
# Shows: anonymous volume with random hash

# Inspect container to see volume mount
docker inspect web1 | grep -A 5 Mounts
```

![ ](../../Screenshots/Exp5/Screenshot%20(850).png)

#### **2. Named Volumes**
```bash
# Create named volume
docker volume create mydata

# Use named volume
docker run -d -v mydata:/app/data --name web2 nginx

# List volumes
docker volume ls
# Shows: mydata

# Inspect volume
docker volume inspect mydata
```

![ ](../../Screenshots/Exp5/Screenshot%20(851).png)

#### **3. Bind Mounts (Host Directory)**
```bash
# Create directory on host
mkdir ~/myapp-data

# Mount host directory to container
docker run -d -v ~/myapp-data:/app/data --name web3 nginx

# Add file on host
echo "From Host" > ~/myapp-data/host-file.txt

# Check in container
docker exec web3 cat /app/data/host-file.txt
# Shows: From Host
```

![ ](../../Screenshots/Exp5/Screenshot%20(852).png)

---

### **Lab 3: Practical Volume Examples**

#### **Example 1: Database with Persistent Storage**
```bash
# MySQL with named volume
docker run -d \
  --name mysql-db \
  -v mysql-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:8.0

# Check data persists
docker stop mysql-db
docker rm mysql-db

# New container with same volume
docker run -d \
  --name new-mysql \
  -v mysql-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:8.0
# Data is preserved!
```

![ ](../../Screenshots/Exp5/Screenshot%20(853).png)

#### **Example 2: Web App with Configuration Files**
```bash
# Create config directory
mkdir ~/nginx-config

# Create nginx config file
echo 'server {
    listen 80;
    server_name localhost;
    location / {
        return 200 "Hello from mounted config!";
    }
}' > ~/nginx-config/nginx.conf

# Run nginx with config bind mount
docker run -d \
  --name nginx-custom \
  -p 8080:80 \
  -v ~/nginx-config/nginx.conf:/etc/nginx/conf.d/default.conf \
  nginx

# Test
curl http://localhost:8080
```

![ ](../../Screenshots/Exp5/Screenshot%20(854).png)

---

### **Lab 4: Volume Management Commands**
```bash
# List all volumes
docker volume ls

# Create a volume
docker volume create app-volume

# Inspect volume details
docker volume inspect app-volume

# Remove unused volumes
docker volume prune

# Remove specific volume
docker volume rm volume-name

# Copy files to/from volume
docker cp local-file.txt container-name:/path/in/volume
```

![ ](../../Screenshots/Exp5/Screenshot%20(855).png)

---

## **Part 2: Environment Variables**

### **Lab 1: Setting Environment Variables**

#### **Method 1: Using -e flag**
```bash
# Single variable
docker run -d \
  --name app1 \
  -e DATABASE_URL="postgres://user:pass@db:5432/mydb" \
  -e DEBUG="true" \
  -p 3000:3000 \
  my-node-app

# Multiple variables
docker run -d \
  -e VAR1=value1 \
  -e VAR2=value2 \
  -e VAR3=value3 \
  my-app
```

![ ](../../Screenshots/Exp5/Screenshot%20(856).png)

#### **Method 2: Using --env-file**
```bash
# Create .env file
echo "DATABASE_HOST=localhost" > .env
echo "DATABASE_PORT=5432" >> .env
echo "API_KEY=secret123" >> .env

# Use env file
docker run -d \
  --env-file .env \
  --name app2 \
  my-app
```

![ ](../../Screenshots/Exp5/Screenshot%20(857).png)

#### **Method 3: In Dockerfile**
```dockerfile
# Set default environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV APP_VERSION=1.0.0

# Can be overridden at runtime
```

---

### **Lab 2: Environment Variables in Applications**

#### **Python Flask Example**
```python
# app.py
import os
from flask import Flask

app = Flask(__name__)

# Read environment variables
db_host = os.environ.get('DATABASE_HOST', 'localhost')
debug_mode = os.environ.get('DEBUG', 'false').lower() == 'true'
api_key = os.environ.get('API_KEY')

@app.route('/config')
def config():
    return {
        'db_host': db_host,
        'debug': debug_mode,
        'has_api_key': bool(api_key)
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
```

#### **Dockerfile with Environment Variables**
```dockerfile
FROM python:3.9-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app.py .

ENV PORT=5000
ENV DEBUG=false

EXPOSE 5000

CMD ["python", "app.py"]
```

![ ](../../Screenshots/Exp5/Screenshot%20(858).png)

---

### **Lab 3: Test Environment Variables**
```bash
# Run with custom env vars
docker run -d \
  --name flask-app \
  -p 5001:5000 \
  -e DATABASE_HOST="mydb" \
  -e DEBUG="true" \
  -e API_KEY="supersecret" \
  flask-env-app

# Check environment in running container
docker exec flask-app env
docker exec flask-app printenv DATABASE_HOST

# Test the endpoint
curl http://localhost:5001/config
```

![ ](../../Screenshots/Exp5/Screenshot%20(859).png)

---

## **Part 3: Docker Monitoring**

### **Lab 1: Basic Monitoring Commands**

#### **`docker stats` - Real-time Container Metrics**
```bash
# Live stats for all containers
docker stats

# No-stream (single snapshot)
docker stats --no-stream

# Specific format output
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
```

![ ](../../Screenshots/Exp5/Screenshot%20(860).png)

#### **Useful Format Options:**
```bash
# JSON output
docker stats --format json --no-stream

# Wide output
docker stats --no-stream --no-trunc
```

![ ](../../Screenshots/Exp5/Screenshot%20(861).png)

---

### **Lab 2: `docker top` - Process Monitoring**
```bash
# View processes in container
docker top monitor-test

# View with full command line
docker top monitor-test -ef

# Compare with host processes
ps aux | grep docker
```

![ ](../../Screenshots/Exp5/Screenshot%20(862).png)

![ ](../../Screenshots/Exp5/Screenshot%20(863).png)

---

### **Lab 3: `docker logs` - Application Logs**
```bash
# View logs
docker logs monitor-test

# Follow logs (like tail -f)
docker logs -f monitor-test

# Last N lines
docker logs --tail 100 monitor-test

# Logs with timestamps
docker logs -t monitor-test

# Logs since specific time
docker logs --since 5m monitor-test

# Combine options
docker logs -f --tail 50 -t monitor-test
```

![ ](../../Screenshots/Exp5/Screenshot%20(864).png)

![ ](../../Screenshots/Exp5/Screenshot%20(865).png)

![ ](../../Screenshots/Exp5/Screenshot%20(866).png)

---

### **Lab 4: Container Inspection**
```bash
# Detailed container info
docker inspect monitor-test

# Specific information
docker inspect --format='{{.State.Status}}' monitor-test
docker inspect --format='{{.Config.Env}}' monitor-test

# Resource limits
docker inspect --format='{{.HostConfig.Memory}}' monitor-test
docker inspect --format='{{.HostConfig.NanoCpus}}' monitor-test
```

![ ](../../Screenshots/Exp5/Screenshot%20(867).png)

---

### **Lab 5: Events Monitoring**
```bash
# Monitor Docker events in real-time
docker events

# Filter events
docker events --filter 'type=container'
docker events --filter 'event=start'
```

![ ](../../Screenshots/Exp5/Screenshot%20(868).png)

---

### **Lab 6: Practical Monitoring Script**
```bash
#!/bin/bash
# monitor.sh - Simple Docker monitoring

echo "=== Docker Monitoring Dashboard ==="
echo "Time: $(date)"
echo

echo "1. Running Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo

echo "2. Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
echo

echo "3. Recent Events:"
docker events --since '5m' --until '0s' --format '{{.Time}} {{.Type}} {{.Action}}' | tail -5
echo

echo "4. System Info:"
docker system df
```

![ ](../../Screenshots/Exp5/Screenshot%20(869).png)

---

## **Part 4: Docker Networks**

### **Lab 1: Understanding Docker Network Types**

#### **List Networks**
```bash
# Default networks
docker network ls
```

---

### **Lab 2: Network Types Explained**

#### **1. Bridge Network (Default)**
```bash
# Create custom bridge network
docker network create my-network

# Run containers on custom network
docker run -d --name web1 --network my-network nginx
docker run -d --name web2 --network my-network nginx

# Containers can communicate using container names
docker exec web1 curl http://web2
```

![ ](../../Screenshots/Exp5/Screenshot%20(870).png)

#### **2. Host Network**
```bash
# Container uses host's network directly
docker run -d --name host-app --network host nginx

# Access directly on host port
curl http://localhost
```

![ ](../../Screenshots/Exp5/Screenshot%20(871).png)

#### **3. None Network**
```bash
# No network access
docker run -d --name isolated-app --network none alpine sleep 3600

# Test - no network interfaces
docker exec isolated-app ifconfig
# Only loopback interface
```

![ ](../../Screenshots/Exp5/Screenshot%20(872).png)

---

### **Lab 3: Network Management Commands**
```bash
# Create network
docker network create app-network

# Connect container to network
docker network connect app-network web1

# Disconnect container from network
docker network disconnect app-network web1

# Remove network
docker network rm app-network

# Prune unused networks
docker network prune
```

![ ](../../Screenshots/Exp5/Screenshot%20(873).png)

---

### **Lab 4: Multi-Container Application Example**

#### **Web App + Database Communication**
```bash
# Create network
docker network create app-network

# Start database
docker run -d \
  --name postgres-db \
  --network app-network \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  postgres:15

# Start web application
docker run -d \
  --name web-app \
  --network app-network \
  -p 8080:3000 \
  -e DATABASE_URL="postgres://postgres:secret@postgres-db:5432/mydb" \
  -e DATABASE_HOST="postgres-db" \
  node-app
```

![ ](../../Screenshots/Exp5/Screenshot%20(874).png)

---

### **Lab 5: Network Inspection & Debugging**
```bash
# Inspect network
docker network inspect bridge

# Check container IP
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container-name
```

![ ](../../Screenshots/Exp5/Screenshot%20(875).png)

---

### **Lab 6: Port Publishing vs Exposing**
```bash
# PORT PUBLISHING (host:container)
docker run -d -p 80:8080 --name app1 nginx

# Dynamic port publishing
docker run -d -p 8080 --name app2 nginx
# Docker assigns random host port

# Multiple ports
docker run -d -p 8082:80 -p 8443:443 --name app3 nginx

# Specific host IP
docker run -d -p 127.0.0.1:8085:80 --name app4 nginx
```

![ ](../../Screenshots/Exp5/Screenshot%20(876).png)

---

## **Part 5: Complete Real-World Example**

### **Application Architecture:**
- Flask Web App (port 5000)
- PostgreSQL Database (port 5432)
- Redis Cache (port 6379)
- All connected via custom network

### **Implementation:**
```bash
# 1. Create network
docker network create myapp-network

# 2. Start database with volume
docker run -d \
  --name postgres \
  --network myapp-network \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=mydatabase \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:15

# 3. Start Redis
docker run -d \
  --name redis \
  --network myapp-network \
  -v redis-data:/data \
  redis:7-alpine

# 4. Start Flask app with all configurations
docker run -d \
  --name flask-app \
  --network myapp-network \
  -p 5001:5000 \
  -v $(pwd)/app:/app \
  -e DATABASE_URL="postgresql://postgres:mysecretpassword@postgres:5432/mydatabase" \
  -e REDIS_URL="redis://redis:6379" \
  -e DEBUG="false" \
  --env-file .env.production \
  flask-app:latest
```

![ ](../../Screenshots/Exp5/Screenshot%20(877).png)

### **Monitoring Commands:**
```bash
# Check all components
docker ps

# Monitor resources
docker stats postgres redis flask-app
```

![ ](../../Screenshots/Exp5/Screenshot%20(878).png)

---

## **Quick Reference Cheatsheet**

### **Volumes:**
```bash
docker volume create <name>
docker run -v <volume>:/path
docker run -v /host/path:/container/path
docker volume ls
docker volume rm <name>
```

### **Environment Variables:**
```bash
docker run -e VAR=value
docker run --env-file .env
# In Dockerfile: ENV VAR=value
```

### **Monitoring:**
```bash
docker stats
docker logs -f <container>
docker top <container>
docker inspect <container>
docker events
```

### **Networks:**
```bash
docker network create <name>
docker run --network <name>
docker network connect <network> <container>
docker network inspect <network>
```

---

## **Cleanup**
```bash
# Stop and remove all containers
docker stop $(docker ps -q)
docker rm $(docker ps -aq)

# Remove all volumes
docker volume prune -f

# Remove all networks (except defaults)
docker network prune -f

# Remove unused images
docker image prune -f
```

---

## **Key Takeaways**

1. **Volumes** persist data beyond container lifecycle
2. **Environment variables** configure containers dynamically
3. **Monitoring commands** help debug and optimize containers
4. **Networks** enable secure container communication
5. **Always use named volumes** for production data
6. **Custom networks** provide better isolation and DNS
7. **Monitor resource usage** to prevent issues
8. **Use .env files** for sensitive configuration

> This experiment covers essential Docker features for building, configuring, and managing production-ready containerized applications.
