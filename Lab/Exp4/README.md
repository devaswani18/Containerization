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

> 📸 **Screenshot `29a.png`** – Shows successful Docker image build process.

![ ](../Screenshots/Exp4/29a.png)

---

### Run the Container

```bash
docker run -d -p 5000:5000 --name flask-container my-flask-app
```

### Test the Application

```bash
curl http://localhost:5000
```

> 📸 **Screenshot `29b.png`** – Shows Flask app responding: `Hello from Docker!`

![ ](../Screenshots/Exp4/29b.png)

---

### Check Running Containers

```bash
docker ps
```

> 📸 **Screenshot `29c.png`** – Shows container running with port mapping `5000:5000`.

![ ](../Screenshots/Exp4/29c.png)

---

### View Logs

```bash
docker logs flask-container
```

> 📸 **Screenshot `29d.png`** – Shows Flask server logs and successful request handling.

![ ](../Screenshots/Exp4/29d.png)

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

> 📸 **Screenshot `29e.png`** – Shows Docker image layers and commands used to build image.

![ ](../Screenshots/Exp4/29e.png)

---

### Inspect the Image

```bash
docker inspect my-flask-app
```

> 📸 **Screenshot `29f.png`** – Shows detailed JSON metadata of the Docker image.

![ ](../Screenshots/Exp4/29f.png)

---

## 🧩 Part 3 – Multi-Stage Build

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

---

### Build the Multi-stage Image

```bash
docker build -f Dockerfile.multistage -t flask-multistage .
```

### Compare Image Sizes

```bash
docker images | grep flask-
```

> 📸 **Screenshot `29g.png`** – Shows multiple Flask images including multi-stage build.

![ ](../Screenshots/Exp4/29g.png)

| Feature | Standard Build | Multi-stage Build |
|---|---|---|
| Image Size | Larger | ✅ Smaller |
| Security | Root user | ✅ Non-root user |
| Production Ready | Moderate | ✅ Optimized |

---

## 🧩 Part 4 – Container Management

### Stop the Container

```bash
docker stop flask-container
```

### Remove the Container

```bash
docker rm flask-container
```

### Force Remove (if still running)

```bash
docker rm -f flask-container
```

> 📸 **Screenshot `29h.png`** – Shows container stop and removal process.

![ ](../Screenshots/Exp4/29h.png)

---

## 🔑 Key Concepts Demonstrated

| Concept | Description |
|---|---|
| `Dockerfile` | Blueprint for building a Docker image |
| Dependency Installation | `pip install` inside the image via `RUN` |
| Port Mapping | `-p host:container` to expose container ports |
| Logs & Status | `docker logs` and `docker ps` for monitoring |
| Image Tagging | Versioning images with `docker tag` |
| Image Inspection | Metadata via `docker inspect` and `docker history` |
| Multi-stage Builds | Separate builder and runtime stages for optimized images |
| Non-root User | Security best practice using `useradd` + `USER` directive |

---

## 🏁 Result

Successfully:

- ✅ Containerized a Flask application
- ✅ Built and tagged Docker images
- ✅ Verified image layers and metadata
- ✅ Implemented multi-stage build
- ✅ Compared image sizes
- ✅ Managed container lifecycle

> Docker concepts were successfully implemented and verified.

---

## 📚 References

- [Docker Official Documentation](https://docs.docker.com/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
