# Lab Experiment 7: CI/CD using Jenkins, GitHub and Docker Hub

---

## 1. Aim

To design and implement a complete CI/CD pipeline using **Jenkins**, integrating source code from **GitHub**, and building & pushing Docker images to **Docker Hub**.

---

## 2. Objectives

- Understand CI/CD workflow using Jenkins (GUI-based tool)
- Create a structured GitHub repository with application + Jenkinsfile
- Build Docker images from source code
- Securely store Docker Hub credentials in Jenkins
- Automate build & push process using webhook triggers
- Use same host (Docker) as Jenkins agent

---

## 3. Theory

### What is Jenkins?

Jenkins is a **web-based GUI automation server** used to:

- Build applications
- Test code
- Deploy software

It provides:

- Dashboard (browser-based UI)
- Plugin ecosystem (GitHub, Docker, etc.)
- Pipeline as Code using `Jenkinsfile`

### What is CI/CD?

- **Continuous Integration (CI):** Code is automatically built and tested after each commit
- **Continuous Deployment (CD):** Built artifacts (Docker images) are automatically delivered/deployed

### Workflow Overview

```
Developer → GitHub → Webhook → Jenkins → Build → Docker Hub
```

---

## 4. Prerequisites

- Docker & Docker Compose installed
- GitHub account
- Docker Hub account
- Basic Linux command knowledge

---

## 5. Part A: GitHub Repository Setup

### 5.1 Project Structure

```
my-app/
├── app.py
├── requirements.txt
├── Dockerfile
├── Jenkinsfile
```

### 5.2 Application Code

#### `app.py`

```python
from flask import Flask
app = Flask(__name__)

@app.route("/")
def home():
    return "Hello from CI/CD Pipeline!"

app.run(host="0.0.0.0", port=80)
```

#### `requirements.txt`

```
flask
```

### 5.3 Dockerfile

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY . .

RUN pip install -r requirements.txt

EXPOSE 80
CMD ["python", "app.py"]
```

### 5.4 Jenkinsfile

```groovy
pipeline {
    agent any

    environment {
        IMAGE_NAME = "devaswani18/myapp"
    }

    stages {

        stage('Clone Source') {
            steps {
                git branch: 'main', url: 'https://github.com/devaswani18/my-app.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME:latest .'
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([string(credentialsId: 'dockerhub-token', variable: 'DOCKER_TOKEN')]) {
                    sh 'echo $DOCKER_TOKEN | docker login -u devaswani18 --password-stdin'
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                sh 'docker push $IMAGE_NAME:latest'
            }
        }
    }
}
```

---

## 6. Part B: Jenkins Setup using Docker

### 6.1 Docker Compose File

```yaml
services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    restart: always
    ports:
      - "8091:8080"
      - "50000:50000"
    user: root
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker

volumes:
  jenkins_home:
```

### 6.2 Start Jenkins

```bash
docker-compose up -d
```

### 6.3 Get Initial Admin Password

```bash
docker exec -it jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

![ ](../Screenshots/Exp7/7b.png)

---

### 6.4 Unlock Jenkins

Access Jenkins at `http://localhost:8091`, paste the password obtained from the command above and click **Continue**:

![ ](../Screenshots/Exp7/7a.png)

---

### 6.5 Install Plugins

Select **Install suggested plugins** to install all recommended plugins:

![ ](../Screenshots/Exp7/7c.png)

---

## 7. Part C: Jenkins Configuration

### 7.1 Create Docker Hub Access Token

On Docker Hub (`app.docker.com`), go to:

```
Account Settings → Personal access tokens → New access token
```

- Description: `Docker Hub Token`
- Permissions: `Read & Write`

![ ](../Screenshots/Exp7/7e.png)

---

### 7.2 Add Docker Hub Credentials in Jenkins

Go to:

```
Manage Jenkins → Credentials → Add Credentials
```

Select **Secret text** as the credential type:

![ ](../Screenshots/Exp7/7d.png)

- ID: `dockerhub-token`
- Value: Docker Hub Access Token generated above

Credential saved successfully:

![ ](../Screenshots/Exp7/7f.png)

---

### 7.3 Create Pipeline Job

1. New Item → Pipeline
2. Name: `ci-cd-pipeline`
3. Description: `CI/CD Pipeline using Jenkins, GitHub and Docker Hub`

Configure:

```
Pipeline script from SCM
SCM: Git
Repository URL: https://github.com/devaswani18/my-app.git
Script Path: Jenkinsfile
```

![ ](../Screenshots/Exp7/7g.png)

Pipeline job created — no builds yet:

![ ](../Screenshots/Exp7/7h.png)

---

## 8. Part D: GitHub Webhook Integration

### 8.1 Expose Jenkins using Localtunnel

Since Jenkins runs locally, use **localtunnel** to expose it publicly for GitHub webhook:

```bash
npm install -g localtunnel
lt --port 8091
```

Public URL generated: `https://three-readers-listen.loca.lt`

![ ](../Screenshots/Exp7/7i.png)

---

### 8.2 Configure Webhook on GitHub

In the `devaswani18/my-app` GitHub repository:

```
Settings → Webhooks → Add Webhook
```

- Payload URL: `https://three-readers-listen.loca.lt/github-webhook/`
- Content type: `application/json`
- Trigger: **Just the push event**

![ ](../Screenshots/Exp7/7j.png)

---

## 9. Part E: Execution Flow

### Stage 1: Code Push

Developer pushes code to the `main` branch on GitHub.

### Stage 2: Webhook Trigger

GitHub sends a POST event to Jenkins via the localtunnel webhook URL, triggering the pipeline automatically.

### Stage 3: Jenkins Pipeline Execution

The pipeline runs through 4 stages:

- **Clone** — Pulls latest code from `https://github.com/devaswani18/my-app.git`
- **Build** — Builds Docker image `devaswani18/myapp:latest` using the Dockerfile
- **Login** — Jenkins logs into Docker Hub using the stored `dockerhub-token` credential securely
- **Push** — Pushes the built image to Docker Hub

### Stage 4: Build Results

The `ci-cd-pipeline` job shows:
- ✅ Build **#3** — Successful (2 min 41 sec ago)
- ⚠️ Build **#2** — Unsuccessful
- ❌ Build **#1** — Failed

![ ](../Screenshots/Exp7/7k.png)

---

### Stage 5: Image on Docker Hub

The Docker image `devaswani18/myapp` is successfully pushed to Docker Hub and visible in the repositories list (Last pushed: 3 minutes ago):

![ ](../Screenshots/Exp7/7l.png)

---

## 10. Verify — Pull and Run the Image

Pull and run the pushed image directly from Docker Hub:

```bash
docker run -p 8085:80 devaswani18/myapp:latest
```

Flask app starts and serves on all addresses:

![ ](../Screenshots/Exp7/7m.png)

---

Open `http://localhost:8085` in the browser to verify the application:

![ ](../Screenshots/Exp7/7n.png)

---

## 11. Role of Same Host Agent

- Jenkins runs inside Docker
- Docker socket is mounted: `/var/run/docker.sock`
- This allows Jenkins to directly control the host Docker daemon
- Builds and pushes images without needing a separate agent

---

## 12. Observations

- Jenkins GUI simplifies CI/CD management
- GitHub acts as both source and pipeline definition store
- Docker ensures consistent and reproducible builds
- Webhook + localtunnel enables full automation locally
- Credentials store keeps secrets secure — never hardcoded

---

## 13. Result

Successfully implemented a complete CI/CD pipeline where:

- ✅ Source code and Jenkinsfile maintained in GitHub (`devaswani18/my-app`)
- ✅ Jenkins started via Docker Compose at `localhost:8091`
- ✅ Docker Hub credentials stored securely as `dockerhub-token`
- ✅ Pipeline job `ci-cd-pipeline` created and configured
- ✅ GitHub webhook configured using localtunnel
- ✅ Build #3 succeeded — image pushed to `devaswani18/myapp`
- ✅ Application verified at `localhost:8085` → **"Hello from CI/CD Pipeline!"**

---

## 14. Key Notes

- Jenkins is **GUI-based but pipeline is code-driven**
- Always use **credentials store — never hardcode secrets**
- Webhook + localtunnel makes CI/CD fully automatic even on localhost
- This setup is ideal for learning and small deployments

---

## 15. Understanding Jenkins Pipeline Syntax

### Basic Structure

```groovy
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'echo Hello'
            }
        }
    }
}
```

### Key Terms

| Term | Meaning |
|---|---|
| `pipeline {}` | Root block — everything goes inside this |
| `agent any` | Run on any available node (same Docker host) |
| `stages {}` | Groups all phases of the pipeline |
| `stage('Name')` | A single phase — visible as a block in Jenkins GUI |
| `steps {}` | Contains actual commands to execute |
| `sh` | Runs Linux shell commands |
| `git` | Clones source code from GitHub |
| `withCredentials` | Securely injects stored secrets temporarily |

### withCredentials — Secure Login Explained

```groovy
withCredentials([string(credentialsId: 'dockerhub-token', variable: 'DOCKER_TOKEN')]) {
    sh 'echo $DOCKER_TOKEN | docker login -u devaswani18 --password-stdin'
}
```

| Part | Meaning |
|---|---|
| `string` | Type of secret (text token) |
| `credentialsId` | ID used when saving in Jenkins (`dockerhub-token`) |
| `variable` | Temporary env variable name (`DOCKER_TOKEN`) |
| `--password-stdin` | Secure login — no plain password in command |

The secret is injected temporarily inside the block and disappears after — it is never exposed in logs or code.
