# 🧪 Experiment 4 – Docker Essentials

> Dockerfile, Tagging & Multi-stage Builds

---

## 🎯 Aim

To understand and implement core Docker concepts:

- Writing a Dockerfile
- Building and tagging Docker images
- Running and managing containers
- Multi-stage builds
- Inspecting and analyzing images

---

## 🗂️ Project Structure

```
experiment-4/
├── app.py
├── requirements.txt
├── Dockerfile
└── Dockerfile.multistage
```

---

## 🧩 Part 1 – Containerizing a Python Flask Application

### Application Code

**`app.py`**
```python
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello from Docker!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

**`requirements.txt`**
```
Flask==2.3.3
```

---

### Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
```

---

### Build the Image

```bash
docker build -t my-flask-app .
```

![ ](../Screenshots/Exp4/29a.png)

---

## 🧩 Part 2 – Image Tagging & Inspection

### Tag the Image

```bash
docker tag my-flask-app:latest my-flask-app:v1.0
```

### View Image History

```bash
docker history my-flask-app
```

### Inspect the Image

```bash
docker inspect my-flask-app
```

![ ](../Screenshots/Exp4/29b.png)

---

## 🧩 Part 3 – Run, Test & Manage Container

### Run the Container

```bash
docker run -d -p 5000:5000 --name flask-container my-flask-app
```

### Test the Application

```bash
curl http://localhost:5000
```

### Check Running Containers

```bash
docker ps
```

### View Logs

```bash
docker logs flask-container
```

### Stop & Remove Container

```bash
docker stop flask-container
docker rm flask-container
```

![ ](../Screenshots/Exp4/29c.png)

---

## 🧩 Part 4 – Multi-Stage Build

### `Dockerfile.multistage`

```dockerfile
# Stage 1 – Builder
FROM python:3.9-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2 – Runtime
FROM python:3.9-slim

WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY app.py .

RUN useradd -m -u 1000 appuser
USER appuser

EXPOSE 5000
CMD ["python", "app.py"]
```

### Build Regular Image (for size comparison)

```bash
docker build -t flask-regular .
```

### Build Multi-stage Image

```bash
docker build -f Dockerfile.multistage -t flask-multistage .
```

![ ](../Screenshots/Exp4/29d.png)

---

### Compare Image Sizes

```bash
docker images | grep flask-
```

![ ](../Screenshots/Exp4/29e.png)

---

## 🧩 Part 5 – Docker Image Registry Overview

```bash
docker images
```

![ ](../Screenshots/Exp4/29f.png)

---

## 🔑 Key Concepts Demonstrated

| Concept | Description |
|---|---|
| `Dockerfile` | Blueprint for building a Docker image |
| Dependency Installation | `pip install` inside the image via `RUN` |
| Port Mapping | `-p 5000:5000` maps host port to container port |
| Logs & Status | `docker logs` and `docker ps` for monitoring |
| Image Tagging | Versioning images with `docker tag` (`v1.0`) |
| Image Inspection | Layer metadata via `docker inspect` and `docker history` |
| Multi-stage Builds | Separate builder and runtime stages for optimized images |
| Non-root User | Security best practice using `useradd` + `USER appuser` |
| Force Remove | `docker rm -f` to remove running containers |

---

## 🏁 Result

Successfully:

- ✅ Containerized a Flask application using a Dockerfile
- ✅ Built image `my-flask-app:latest` (200MB) and tagged as `v1.0`
- ✅ Ran container with port mapping `5000:5000` and verified `Hello from Docker!`
- ✅ Inspected image layers and JSON metadata via `docker history` and `docker inspect`
- ✅ Implemented multi-stage build (`flask-multistage`, 219MB)
- ✅ Compared image sizes across `flask-regular`, `my-flask-app`, and `flask-multistage`
- ✅ Managed full container lifecycle (run → stop → remove)

> Docker concepts were successfully implemented and verified.

---

## 📚 References

- [Docker Official Documentation](https://docs.docker.com/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
