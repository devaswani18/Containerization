# Experiment 11 – Orchestration using Docker Compose & Docker Swarm

## Objective

To understand and implement container orchestration using Docker Swarm as a continuation of Experiment 6 (WordPress + MySQL using Docker Compose), and to demonstrate features like scaling, self-healing, and load balancing.

---

## Prerequisites

- Docker installed with Swarm mode available
- `docker-compose.yml` from Experiment 6 (WordPress + MySQL setup)

---

## Theory

**Orchestration** is the automatic management of containers across one or more hosts. Docker Swarm extends Docker Compose by adding:

| Feature | Description |
|---|---|
| Scaling | Increase/decrease container replicas with one command |
| Self-Healing | Automatically restarts failed containers |
| Load Balancing | Distributes traffic across all replicas internally |
| Multi-Host | Can span containers across multiple machines |

**Progression Path:**
```
docker run → Docker Compose → Docker Swarm → Kubernetes
```

---

## Procedure

### Task 1 – Initialize Docker Swarm

```bash
docker swarm init
docker node ls
```

The `docker swarm init` command enables Swarm mode and makes the current machine a **manager node**.

![Swarm Init & Stack Deploy](../Screenshots/Exp11/11a.png)

**Observation:** Node status shows `Ready`, `Active`, and `Leader` — confirming Swarm is initialized. The stack deploy command created `wpstack_default` network, `wpstack_db`, and `wpstack_wordpress` services.

---

### Task 2 – Deploy Stack & Verify Services

```bash
docker stack deploy -c docker-compose.yml wpstack
docker service ls
docker ps
```

![Service List & Container Status](../Screenshots/Exp11/11b.png)

**Observation:**
- `wpstack_db` — replicated, 1/1 replica running (`mysql:5.7`)
- `wpstack_wordpress` — replicated, 1/1 replica running (`wordpress:latest`) on port `*:8080->80/tcp`
- Containers are now named with the pattern `<stack>_<service>.<replica>.<id>`, managed by Swarm

---

### Task 3 – Access WordPress via Browser

Opened browser at `http://localhost:8080/wp-login.php`

![WordPress Login Page](../Screenshots/Exp11/11c.png)

**Observation:** WordPress login page is accessible, confirming the stack is running correctly under Swarm management.

---

### Task 4 – WordPress Admin Dashboard

Logged in to the WordPress admin panel at `http://localhost:8080/wp-admin/`

![WordPress Dashboard](../Screenshots/Exp11/11d.png)

**Observation:** WordPress 6.9.4 dashboard is fully functional. The site is titled **"Swarm Demo Site"**, confirming the WordPress + MySQL stack is working end-to-end under Swarm.

---

### Task 5 – Scale the WordPress Service

```bash
docker service scale wpstack_wordpress=3
docker service ls
docker ps
```

![Scaling to 3 Replicas](../Screenshots/Exp11/11e.png)

**Observation:**
- Scaling progressed: 1/3 → 2/3 → 3/3 tasks running
- `docker service ls` shows `REPLICAS: 3/3` for `wpstack_wordpress`
- `docker ps` confirms **3 WordPress containers** running simultaneously:
  - `wpstack_wordpress.1`, `.2`, `.3`
- All 3 share port `8080` via Swarm's **internal load balancer** — no port conflicts

---

### Task 6 – Test Self-Healing

```bash
docker ps | grep wordpress
docker kill 5ed7a4e16c62
docker service ps wpstack_wordpress
docker ps | grep wordpress
```

![Self-Healing Demo](../Screenshots/Exp11/11f.png)

**Observation:**
- Container `5ed7a4e16c62` (`wpstack_wordpress.3`) was killed manually
- `docker service ps` shows the killed container as `Shutdown` / `Failed 21 seconds ago` with exit code `137`
- Swarm **automatically spawned a new container** (`wpstack_wordpress.3.iivz0kx1gzko`) within seconds
- Final `docker ps | grep wordpress` confirms **3 containers still running** — self-healing worked

After cleanup:
```bash
docker stack rm wpstack
docker service ls   # Empty — all services removed
docker ps           # Empty — all containers stopped
```

---

## Result

All tasks were completed successfully:

| Task | Command | Result |
|---|---|---|
| Initialize Swarm | `docker swarm init` | Node became manager/leader |
| Deploy Stack | `docker stack deploy` | 2 services created (db + wordpress) |
| Verify Services | `docker service ls` | Both services running at 1/1 |
| Access App | Browser at `localhost:8080` | WordPress fully accessible |
| Scale Service | `docker service scale ...=3` | 3/3 WordPress replicas running |
| Self-Healing | `docker kill <id>` | Failed container auto-replaced |
| Remove Stack | `docker stack rm wpstack` | All services and networks removed |

---

## Key Observations

**1. Same Compose file works for both Compose and Swarm:**

| Command | Mode |
|---|---|
| `docker compose up -d` | Standard Compose (no orchestration) |
| `docker stack deploy -c docker-compose.yml` | Swarm (with orchestration) |

**2. Services vs Containers:** In Swarm, you manage **services** (definitions), not individual containers. Swarm handles container lifecycle internally.

**3. Port Conflict Resolution:** Scaling in plain Compose would fail due to port conflicts. Swarm's internal load balancer listens on port `8080` once and routes traffic to all replicas transparently.

**4. Self-Healing:** When a container is killed (exit 137), Swarm detects the replica count dropped below desired state and automatically creates a replacement — no manual intervention needed.

---

## Docker Compose vs Docker Swarm

| Feature | Docker Compose | Docker Swarm |
|---|---|---|
| Scope | Single host | Multi-node cluster |
| Scaling | Basic (`--scale`), no load balancing | Built-in (`service scale`) |
| Load Balancing | No | Yes (internal VIP) |
| Self-Healing | No | Yes (automatic) |
| Rolling Updates | No | Yes |
| Use Case | Development / Testing | Production clusters |

---

## Quick Reference

```bash
docker swarm init                                        # Initialize Swarm
docker stack deploy -c docker-compose.yml <stack-name>  # Deploy stack
docker service ls                                        # List services
docker service scale <stack_service>=<n>                 # Scale service
docker service ps <service-name>                         # See service tasks
docker stack rm <stack-name>                             # Remove stack
docker swarm leave --force                               # Leave Swarm
```
