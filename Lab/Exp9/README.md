# Experiment 9 – Ansible Automation Using Docker Servers

## Overview

This experiment demonstrates how **Ansible** can be used to automate configuration and management of multiple servers. Docker containers are used as test servers, and Ansible connects to them via SSH to execute tasks.

> **Note:** Due to compatibility issues between Ansible modules and Python 3.12 in minimal Ubuntu containers (`six.moves` dependency errors), the standard `apt` and `copy` modules could not be used. Instead, the **Ansible `raw` module** was used throughout, which executes commands directly over SSH without relying on Python-based modules. The inventory was also adapted to use **localhost with port mapping** (2201–2204) instead of container IPs for reliable connectivity in the WSL environment. The main objectives were still fully achieved.

---

## Objective

- Install and configure Ansible
- Create Docker containers to act as servers
- Establish SSH key-based authentication
- Create an Ansible inventory
- Execute Ansible commands and playbooks using the `raw` module to configure servers automatically

---

## Prerequisites

- Ubuntu/WSL environment
- Docker installed
- Python installed
- Internet connection

---

## Step 1: Install Ansible

Update packages and install Ansible:

```bash
sudo apt update -y
sudo apt install ansible -y
```

![ ](../Screenshots/Exp9/9a.png)

Verify installation and test locally:

```bash
ansible --version
ansible localhost -m ping
```

![ ](../Screenshots/Exp9/9b.png)

---

## Step 2: Generate SSH Key Pair

Create SSH keys for authentication between control node and servers:

```bash
ssh-keygen -t rsa -b 4096
```

Copy the keys to the working directory:

```bash
cp ~/.ssh/id_rsa .
cp ~/.ssh/id_rsa.pub .
```

![ ](../Screenshots/Exp9/9b.png)

---

## Step 3: Create Dockerfile for SSH Server

Create a file named `Dockerfile`:

```bash
nano Dockerfile
```

```dockerfile
FROM ubuntu

RUN apt update -y
RUN apt install -y python3 python3-pip openssh-server
RUN mkdir -p /var/run/sshd

RUN mkdir -p /run/sshd && \
    echo 'root:password' | chpasswd && \
    sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config && \
    sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config

RUN mkdir -p /root/.ssh && chmod 700 /root/.ssh

COPY id_rsa /root/.ssh/id_rsa
COPY id_rsa.pub /root/.ssh/authorized_keys

RUN chmod 600 /root/.ssh/id_rsa
RUN chmod 644 /root/.ssh/authorized_keys

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]
```

---

## Step 4: Build Docker Image & Start Servers

Build the Docker image named `ubuntu-server` and start 4 containers:

```bash
docker build -t ubuntu-server .
```

```bash
for i in {1..4}; do
  docker run -d -p 220${i}:22 --name server${i} ubuntu-server
done
```

![ ](../Screenshots/Exp9/9c.png)

Verify all 4 containers are running:

```bash
docker ps
```

Get IP addresses of each container:

```bash
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' server1
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' server2
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' server3
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' server4
```

Output:
```
172.17.0.3
172.17.0.4
172.17.0.5
172.17.0.6
```

![ ](../Screenshots/Exp9/9d.png)

---

## Step 5: Test SSH Connectivity to All Servers

SSH into each container via port mapping to verify key-based authentication works:

```bash
ssh -i ~/.ssh/id_rsa root@localhost -p 2201
exit
```

![ ](../Screenshots/Exp9/9e.png)

```bash
ssh root@localhost -p 2201
ssh root@localhost -p 2202
```

![ ](../Screenshots/Exp9/9f.png)

```bash
ssh root@localhost -p 2203
ssh root@localhost -p 2204
```

![ ](../Screenshots/Exp9/9g.png)

---

## Step 6: Create Ansible Inventory

Due to WSL networking constraints, the inventory uses **localhost with port mapping** instead of container IPs:

```bash
nano inventory.ini
```

```ini
[servers]
server1 ansible_host=127.0.0.1 ansible_port=2201
server2 ansible_host=127.0.0.1 ansible_port=2202
server3 ansible_host=127.0.0.1 ansible_port=2203
server4 ansible_host=127.0.0.1 ansible_port=2204

[servers:vars]
ansible_user=root
ansible_ssh_private_key_file=~/.ssh/id_rsa
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_common_args='-o StrictHostKeyChecking=no'
```

---

## Step 7: Test Ansible Connectivity Using Raw Module

Instead of the `ping` module (which requires Python dependencies), the `raw` module is used:

```bash
ansible all -i inventory.ini -m raw -a "echo CONNECTED"
```

All 4 servers respond with `CONNECTED`:

```bash
ansible all -i inventory.ini -m raw -a "apt update"
```

![ ](../Screenshots/Exp9/9h.png)

---

## Step 8: Install Packages on All Servers Using Raw Module

```bash
ansible all -i inventory.ini -m raw -a "apt install -y vim htop wget"
```

![ ](../Screenshots/Exp9/9i.png)

---

## Step 9: Create Test File and Verify Using Raw Module

Create a test file on all servers:

```bash
ansible all -i inventory.ini -m raw -a "echo 'Configured by Ansible' > /root/ansible_test.txt"
```

Verify the file on all servers:

```bash
ansible all -i inventory.ini -m raw -a "cat /root/ansible_test.txt"
```

All servers output: `Configured by Ansible`

![ ](../Screenshots/Exp9/9j.png)

---

## Step 10: Create and Run Ansible Playbook

Create a playbook using the `raw` module:

```bash
nano playbook1.yml
```

```yaml
---
- name: Configure servers using raw module
  hosts: all
  gather_facts: no

  tasks:
    - name: Update packages
      raw: apt update -y

    - name: Install packages
      raw: apt install -y vim htop wget

    - name: Create test file
      raw: echo 'Configured by Ansible' > /root/ansible_test.txt
```

Run the playbook:

```bash
ansible-playbook -i inventory.ini playbook1.yml
```

All 3 tasks execute successfully on all 4 servers — `ok=3 changed=3 failed=0`:

![ ](../Screenshots/Exp9/9k.png)

---

## Step 11: Final Verification

Verify the test file is present on all servers after playbook run:

```bash
ansible all -i inventory.ini -m raw -a "cat /root/ansible_test.txt"
```

Output on all servers: `Configured by Ansible`

---

## Step 12: Cleanup

Remove all containers after completing the experiment:

```bash
for i in {1..4}; do
  docker rm -f server${i}
done
```

![ ](../Screenshots/Exp9/9l.png)

---

## Result

Ansible successfully automated the configuration of multiple Docker-based servers by:

- ✅ Establishing SSH key-based connectivity to all 4 containers
- ✅ Using `raw` module to bypass Python dependency issues
- ✅ Running `apt update` and installing `vim`, `htop`, `wget` across all servers
- ✅ Creating `/root/ansible_test.txt` with content `Configured by Ansible` on all servers
- ✅ Running a complete playbook with 3 tasks — all `ok=3 changed=3 failed=0`
- ✅ Verified file content and cleaned up all containers

---

## Conclusion

This experiment demonstrates how **Ansible enables efficient infrastructure automation** by allowing a control node to manage multiple servers using SSH. When standard modules fail due to environment constraints, the **`raw` module** provides a reliable fallback that executes shell commands directly without requiring Python dependencies on managed nodes. The experiment successfully achieved all automation objectives across 4 Docker-based servers.

---

## Why Raw Module Was Used (Error Explanation)

| Issue | Cause | Solution Applied |
|---|---|---|
| `apt` module failed | `six.moves` missing in Python 3.12 minimal Ubuntu | Used `raw` module instead |
| `copy` module failed | Python dependency not available in container | Used `raw: echo ... > file` |
| Container IP unreachable | WSL2 networking constraints | Used `localhost` + port mapping (2201–2204) |
| `ping` module failed | Requires Python on managed node | Used `raw -a "echo CONNECTED"` |
