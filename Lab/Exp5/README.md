# **Experiment 5: Docker - Volumes, Environment Variables, Monitoring & Networks**

## **Part 1: Docker Volumes - Persistent Data Storage**

### **Lab 1: Understanding Data Persistence**

#### **The Problem: Container Data is Ephemeral**

```bash
docker run -it --name test-container ubuntu /bin/bash
echo "Hello World" > message.txt
cat message.txt
exit
docker stop test-container
docker rm test-container
docker run -it --name test-container ubuntu /bin/bash
cat message.txt
# cat: message.txt: No such file or directory
```

```bash
# Anonymous volume
docker run -d -v /app/data --name web1 nginx
docker volume ls
docker inspect web1 | grep -A 5 Mounts
```

![ ](../Screenshots/Exp5/Screenshot%20(849).png)

---

### **Lab 2: Volume Types**

#### **1. Named Volumes**

```bash
docker volume create mydata
docker run -d -v mydata:/app/data --name web2 nginx
docker volume ls
docker volume inspect mydata
docker run -d -v ~/myapp-data:/app/data --name web3 nginx
```

![ ](../Screenshots/Exp5/Screenshot%20(850).png)

#### **2. Bind Mounts (Host Directory)**

```bash
mkdir myapp-data
ls
docker run -d -v $(pwd)/myapp-data:/app/data --name web3 nginx
echo "From Host" > myapp-data/host-file.txt
docker exec -it web3 bash
ls /app/data
cat /app/data/host-file.txt
# From Host
exit
docker run -d \
  --name mysql-db \
  -v mysql-data:/var/lib/mysql \
```

![ ](../Screenshots/Exp5/Screenshot%20(851).png)

---

### **Lab 3: Practical Volume Examples**

#### **Example 1: Database with Persistent Storage**

```bash
# mysql:8.0 pulling layers
docker stop mysql-db
docker rm mysql-db
docker run -d \
  --name new-mysql \
  -v mysql-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:8.0
mkdir ~/nginx-config
echo 'server {
    listen 80;
    server_name localhost;
    location / {
        return 200 "Hello from mounted config!";
    }
}' > ~/nginx-config/nginx.conf
docker run -d \
  --name nginx-custom \
  -p 8080:80 \
  -v ~/nginx-config/nginx.conf:/etc/nginx/conf.d/default.conf \
  nginx
```

![ ](../Screenshots/Exp5/Screenshot%20(852).png)

#### **Example 2: Web App with Configuration Files**

```bash
curl http://localhost:8080
# Hello from mounted config!
curl http://localhost:8080
# Hello from mounted config!
docker volume create app-volume
docker volume inspect app-volume
docker volume prune
# Deleted Volumes listed
# Total reclaimed space: 246.1MB
docker run -d \
  --name app1 \
  -e DATABASE_URL="postgres://user:pass@db:5432/mydb" \
  -e DEBUG="true" \
  -p 3000:3000 \
  nginx
# Error: container name "/app1" already in use
```

![ ](../Screenshots/Exp5/Screenshot%20(853).png)

---

## **Part 2: Environment Variables**

### **Lab 1: Setting Environment Variables**

#### **Method 1: Using -e flag**

```bash
docker rm -f app11
docker run -d \
  --name app11 \
  -e DATABASE_URL="postgres://user:pass@db:5432/mydb" \
  -e DEBUG="true" \
  -p 3005:3000 \
  nginx
docker ps
# Shows: app11, nginx-custom, new-mysql, web3, web2, web1, node-container
```

![ ](../Screenshots/Exp5/Screenshot%20(854).png)

```bash
docker exec -it app11 bash
env | grep DATABASE
# DATABASE_URL=postgres://user:pass@db:5432/mydb
env | grep DEBUG
# DEBUG=true
exit
docker rm -f app11
```

#### **Method 2: Using --env-file**

```bash
mkdir env-lab
cd env-lab
echo "DATABASE_HOST=localhost" > .env
echo "DATABASE_PORT=5432" >> .env
echo "API_KEY=secret123" >> .env
cat .env
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
# API_KEY=secret123
docker run -d --name app2 --env-file .env nginx
# Error: name "/app2" already in use
docker run -d --name app22 --env-file .env nginx
docker exec -it app22 bash
echo $DATABASE_HOST
```

![ ](../Screenshots/Exp5/Screenshot%20(855).png)

```bash
# localhost
echo $DATABASE_PORT
# 5432
echo $API_KEY
# secret123
exit
docker rm -f app22
cd ..
mkdir flask-env-app
cd flask-env-app
echo "flask" > requirements.txt
nano app.py
nano Dockerfile
docker build -t flask-env-app .
# [+] Building 7.4s (10/10) FINISHED
```

![ ](../Screenshots/Exp5/Screenshot%20(856).png)

---

### **Lab 2: Flask App with Environment Variables**

#### **Dockerfile Build and Run**

```bash
# Build output - all 5 steps completing successfully
docker run -d \
  --name flask1 \
  -p 5001:5000 \
  -e DATABASE_HOST=mydb \
  -e DEBUG=true \
  -e API_KEY=supersecret \
  flask-env-app
# Error: port 0.0.0.0:5000 already allocated
docker rm -f flask1
docker run -d \
  --name flask1 \
  -p 5001:5000 \
  -e DATABASE_HOST=mydb \
  -e DEBUG=true \
  -e API_KEY=supersecret \
  flask-env-app
# Container started successfully
```

![ ](../Screenshots/Exp5/Screenshot%20(857).png)

### **Lab 3: Test Environment Variables**

```bash
# Browser: localhost:5001/config
# Output:
# {
#   "db_host": "mydb",
#   "debug": true,
#   "has_api_key": true
# }
```

![ ](../Screenshots/Exp5/Screenshot%20(858).png)

---

## **Part 3: Docker Monitoring**

### **Lab 1: `docker stats` - Real-time Container Metrics**

```bash
docker stats
# Live output:
# CONTAINER ID  NAME             CPU%   MEM USAGE/LIMIT      MEM%   NET I/O          BLOCK I/O        PIDs
# e3d6ecfd0537  nginx-custom     0.00%  13.26MiB / 7.61GiB  0.17%  2.8kB / 1.21kB   0B / 4.1kB       17
# 400c92a389aa  new-mysql        1.28%  349.6MiB / 7.61GiB  4.49%  1.84kB / 126B    65.5kB / 15.1MB  37
# 64c60d1c7094  web3             0.00%  14.54MiB / 7.61GiB  0.19%  2.09kB / 126B    1.75MB / 16.4kB  17
# b5eb8c54ccef  web2             0.00%  13.2MiB / 7.61GiB   0.17%  2.34kB / 126B    0B / 12.3kB      17
# 64050fff09e7  web1             0.00%  24.27MiB / 7.61GiB  0.31%  2.47kB / 126B    14.5MB / 12.3kB  17
# 4c95018c9687  node-container   0.00%  16.1MiB / 7.61GiB   0.21%  4.02kB / 1.35kB  0B / 0B          7
# 1af8072d2f3c  dreamy_roentgen  0.03%  31.67MiB / 7.61GiB  0.41%  4.13kB / 126B    20.6MB / 127kB   1
```

![ ](../Screenshots/Exp5/Screenshot%20(859).png)

```bash
# docker stats --no-stream (all values show --)
docker stats --format json --no-stream
# JSON output per container with BlockIO, CPUPerc, Container, ID,
# MemPerc, MemUsage, Name, NetIO, PIDs fields
docker stats --no-stream --no-trunc
```

![ ](../Screenshots/Exp5/Screenshot%20(860).png)

---

### **Lab 2: `docker top` - Process Monitoring**

```bash
docker rm -f monitor-test
docker run -d --name monitor-test -p 8090:80 nginx
docker top monitor-test
# UID   PID   PPID  C  STIME  TTY  TIME      CMD
# root  3944  3920  0  14:30  ?    00:00:00  nginx: master process nginx -g daemon off;
# statd 3989  3944  0  14:30  ?    00:00:00  nginx: worker process
# statd 3990  3944  0  14:30  ?    00:00:00  nginx: worker process
# (worker processes 3989 - 4004 listed)
docker top monitor-test -ef
```

![ ](../Screenshots/Exp5/Screenshot%20(861).png)

```bash
# docker top monitor-test -ef continued
# showing same worker process list with full command lines
# UID, PID, PPID, C, STIME, TTY, TIME, CMD columns
# worker processes 3998 - 4004
```

![ ](../Screenshots/Exp5/Screenshot%20(862).png)

---

### **Lab 3: `docker logs` - Application Logs**

```bash
# docker top -ef continued (worker processes 4002-4004)
ps aux | grep docker
# root   615  0.0  0.3  docker-desktop proxy --distro-name Ubuntu-22.04
# aswani 2149 0.0  0.0  grep --color=auto docker
docker logs monitor-test
# /docker-entrypoint.sh: configuration complete; ready for start up
# nginx/1.29.5 startup notices
# worker processes starting (30-45)
```

![ ](../Screenshots/Exp5/Screenshot%20(863).png)

```bash
# docker logs continued:
# nginx worker processes (30-45) started
# HTTP access logs:
# 172.17.0.1 - [02/Mar/2026] "GET / HTTP/1.1" 200 615
# 172.17.0.1 - [02/Mar/2026] "GET /favicon.ico HTTP/1.1" 404 555
# [error] favicon.ico failed (2: No such file or directory)
docker logs --tail 100 monitor-test
```

![ ](../Screenshots/Exp5/Screenshot%20(864).png)

```bash
docker logs -t monitor-test
# Logs with nanosecond timestamps:
# 2026-03-02T14:30:43.355838305Z /docker-entrypoint.sh: ...
# 2026-03-02T14:30:43.431310396Z [notice] nginx/1.29.5
# 2026-03-02T14:30:43.431372134Z [notice] built by gcc 14.2.0
# (all worker processes with full timestamps)
```

![ ](../Screenshots/Exp5/Screenshot%20(865).png)

```bash
docker logs --since 5m monitor-test
# Shows all logs from last 5 minutes including startup + HTTP requests

docker logs -f --tail 50 -t monitor-test
# Combined: follow + last 50 lines + timestamps
```

![ ](../Screenshots/Exp5/Screenshot%20(866).png)

```bash
# docker logs -f --tail 50 -t continued
# timestamped startup logs and HTTP access logs showing
```

![ ](../Screenshots/Exp5/Screenshot%20(867).png)

---

### **Lab 4: Container Inspection**

```bash
docker inspect monitor-test
# Full JSON output:
# "Id": "24dbc24c9c690a8398cf8c1355e371086461a1055e45ef1a29e4c6d3127ce1f4"
# "Created": "2026-03-02T14:30:42.967030997Z"
# "State": {
#   "Status": "running",
#   "Running": true,
#   "Paused": false,
#   "Pid": 3944,
#   "ExitCode": 0
# }
# "Name": "/monitor-test"
# "Driver": "overlayfs"
```

![ ](../Screenshots/Exp5/Screenshot%20(868).png)

```bash
docker inspect --format='{{.Config.Env}}' monitor-test
# [PATH=... NGINX_VERSION=1.29.5 NJS_VERSION=0.9.5 ...]
docker inspect --format='{{.HostConfig.Memory}}' monitor-test
# 0
docker inspect --format='{{.HostConfig.NanoCpus}}' monitor-test
# 0
docker events
# (waiting, Ctrl+C to exit)
docker stop monitor-test
docker events
# (Ctrl+C)
docker events --filter 'type=container'
# Shows docker stats table with all running containers
```

![ ](../Screenshots/Exp5/Screenshot%20(869).png)

---

### **Lab 5: Practical Monitoring Script**

```bash
./monitor.sh
# === Docker Monitoring Dashboard ===
# Time: Mon Mar 2 20:11:57 IST 2026
#
# 1. Running Containers:
# NAMES            STATUS            PORTS
# nginx-custom     Up 40 minutes     0.0.0.0:8080->80/tcp
# new-mysql        Up 41 minutes     3306/tcp, 33060/tcp
# web3             Up 45 minutes     80/tcp
# web2             Up 52 minutes     80/tcp
# web1             Up 54 minutes     80/tcp
# node-container   Up About an hour  0.0.0.0:3000->3000/tcp
# dreamy_roentgen  Up About an hour  0.0.0.0:5000->5000/tcp
#
# 2. Resource Usage:
# NAME            CPU%   MEM USAGE/LIMIT      NET I/O           BLOCK I/O
# nginx-custom    0.00%  13.26MiB/7.61GiB     3.01kB/1.21kB    0B/4.1kB
# new-mysql       0.86%  349.6MiB/7.61GiB     2.05kB/126B      65.5kB/15.1MB
# web3            0.00%  14.54MiB/7.61GiB     2.3kB/126B       1.75MB/16.4kB
# web2            0.00%  13.2MiB/7.61GiB      2.55kB/126B      0B/12.3kB
# web1            0.00%  24.45MiB/7.61GiB     2.68kB/126B      14.5MB/12.3kB
# node-container  0.00%  16.11MiB/7.61GiB     4.23kB/1.35kB    0B/0B
# dreamy_roentgen 0.03%  31.67MiB/7.61GiB     4.34kB/126B      20.6MB/127kB
#
# 3. Recent Events: (none shown)
#
# 4. System Info:
# TYPE          TOTAL  ACTIVE  SIZE      RECLAIMABLE
# Images          24     15   6.887GB   3.065GB (44%)
# Containers      36      7   1.872MB   1.311MB (70%)
# Local Volumes   12      9   863.2MB   234.2MB (27%)
# Build Cache     95      0   51.3MB    51.3MB
```

![ ](../Screenshots/Exp5/Screenshot%20(870).png)

---

## **Part 4: Docker Networks**

### **Lab 1: Multi-Service Setup**

```bash
# flask-app image build from ubuntu:22.04
# [+] Building 61.0s (7/7) FINISHED
# docker stats showing all 3 services:
# CONTAINER ID  NAME       CPU%   MEM USAGE/LIMIT
# 3f89c6e81ba8  postgres   0.01%  31.61MiB/7.61GiB
# c0e7a059f3da  redis      1.76%  3.352MiB/7.61GiB
# 82d8f44ec481  flask-app  0.00%  13.04MiB/7.61GiB
```

![ ](../Screenshots/Exp5/Screenshot%20(871).png)

---

### **Lab 2: Bridge Network**

```bash
docker run -d --name web1 --network my-network nginx
# Error: container name "/web1" already in use
docker ps -a | grep web1
docker rm -f web1
docker rm -f web2
docker run -d --name web1 --network my-network nginx
# Error: network my-network not found
docker network create my-network
```

![ ](../Screenshots/Exp5/Screenshot%20(872).png)

```bash
# curl output - web1 responding with nginx default page HTML
docker run -d --name host-app --network host nginx
curl http://localhost
# curl: (7) Failed to connect to localhost port 80 after 1 ms: Connection refused
```

![ ](../Screenshots/Exp5/Screenshot%20(873).png)

---

### **Lab 3: Host & None Network**

```bash
curl http://localhost:8085
# Returns nginx default HTML page

docker run -d --name isolated-app --network none alpine sleep 3600
docker exec isolated-app ifconfig
# lo   Link encap:Local Loopback
#      inet addr:127.0.0.1  Mask:255.0.0.0
#      inet6 addr: ::1/128 Scope:Host
```

![ ](../Screenshots/Exp5/Screenshot%20(874).png)

```bash
# ifconfig continued:
# UP LOOPBACK RUNNING  MTU:65536  Metric:1
# RX packets:0 errors:0 TX packets:0 errors:0
# Only loopback - no external network access

docker network create app-network
docker network connect app-network web1
docker network disconnect app-network web1
docker network rm app-network
docker network prune
# Deleted Networks: my_overlay, my_ipvlan, 26compose_wordpress-network, mybridge
```

![ ](../Screenshots/Exp5/Screenshot%20(875).png)

---

### **Lab 4: Multi-Container App - Web + Database**

```bash
docker network create app-network
docker run -d \
  --name postgres-db \
  --network app-network \
  -e POSTGRES_PASSWORD=secret \
  -v pgdata:/var/lib/postgresql/data \
  postgres:15
# Pulling postgres:15 - all layers Pull complete
# Status: Downloaded newer image for postgres:15
```

![ ](../Screenshots/Exp5/Screenshot%20(876).png)

```bash
docker run -d \
  --name web-app \
  --network app-network \
  -p 8080:3000 \
  -e DATABASE_URL="postgres://postgres:secret@postgres-db:5432/mydb" \
  -e DATABASE_HOST="postgres-db" \
  node-app
# Error: pull access denied for node-app (image doesn't exist locally)

docker network inspect bridge
# "Name": "bridge"
# "Driver": "bridge"
# "EnableIPv4": true
# "IPAM": { "Config": [{ "Subnet": "172.17.0.0/16" }] }
```

![ ](../Screenshots/Exp5/Screenshot%20(877).png)

```bash
# bridge inspect continued:
# IPv4Address: "172.17.0.8/16"
docker stop $(docker ps -q)
docker rm $(docker ps -aq)
# All container IDs listed and removed
```

![ ](../Screenshots/Exp5/Screenshot%20(878).png)

---

### **Lab 5: Port Publishing**

```bash
docker ps
# (empty)
docker run -d -p 80:8080 --name app1 nginx
docker run -d -p 8080 --name app2 nginx
docker ps
# app2: 0.0.0.0:56066->8080/tcp  (random port assigned)
# app1: 0.0.0.0:80->8080/tcp
docker run -d -p 8082:80 -p 8443:443 --name app3 nginx
docker run -d -p 127.0.0.1:8085:80 --name app4 nginx
docker network create myapp-network
docker network ls
# NETWORK ID    NAME           DRIVER   SCOPE
# app-network   bridge         local
# bridge        bridge         local
# docker_gwbridge bridge       local
# host          host           local
# ingress       overlay        swarm
# my-network    bridge         local
# myapp-network bridge         local
```

![ ](../Screenshots/Exp5/Screenshot%20(879).png)

---

## **Part 5: Complete Real-World Example**

### **Flask + PostgreSQL + Redis Setup**

```bash
docker run -d \
  --name redis \
  --network myapp-network \
  -v redis-data:/data \
  redis:7-alpine
# Pulling redis:7-alpine - all layers Pull complete
# Status: Downloaded newer image for redis:7-alpine
mkdir app
echo "print('Flask app placeholder')" > app/app.py
echo "SECRET_KEY=supersecretkey" > .env.production
echo "APP_ENV=production" >> .env.production
cat .env.production
# SECRET_KEY=supersecretkey
# APP_ENV=production
docker build -t flask-app:latest .
# [+] Building 61.0s (7/7) FINISHED
```

![ ](../Screenshots/Exp5/Screenshot%20(880).png)

### **Monitoring All Services**

```bash
# docker stats (no-stream) - postgres, redis, flask-app all showing --
# Ctrl+C
docker ps
# CONTAINER ID  IMAGE             STATUS            PORTS
# 82d8f44ec481  flask-app:latest  Up About a minute 0.0.0.0:5001->5000/tcp
# c0e7a059f3da  redis:7-alpine    Up 5 minutes      6379/tcp
# 3f89c6e81ba8  postgres:15       Up 5 minutes      5432/tcp
# c3bd026c0662  nginx             Up 7 minutes      127.0.0.1:8085->80/tcp
# 463fb8a03d27  nginx             Up 8 minutes      0.0.0.0:8082->80/tcp, 0.0.0.0:8443->443/tcp
# 6d89446bafca  nginx             Up 8 minutes      0.0.0.0:56066->8080/tcp
# e39d19b62d69  nginx             Up 8 minutes      0.0.0.0:80->8080/tcp
```

![ ](../Screenshots/Exp5/Screenshot%20(881).png)

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
