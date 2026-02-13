# Experiment: NGINX Deployment Using Different Base Images

## Objective
Deploy NGINX using different Docker base images and compare image size, layers, and usage.

## Part 1: Official NGINX Image
```
docker pull nginx:latest
docker run -d --name nginx-official -p 8080:80 nginx
curl http://localhost:8080
```

![ ](Screenshots/Exp3/part1.png)

## Part 2: Ubuntu base Image

Dockerfile :
```
FROM ubuntu:22.04
   RUN apt-get update && \
      apt-get install -y nginx && \
      apt-get clean && \
      rm -rf /var/lib/apt/lists/*

  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
```

![ ](Screenshots/Exp3/2-1.png)
![ ](Screenshots/Exp3/2-2.png)

## Part 3: Alpine Base Image

Dockerfile :
```
FROM alpine:3.18

RUN apk update && apk add --no-cache nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
![ ](Screenshots/Exp3/3-1.png)

Using custom HTML :
![ ](Screenshots/Exp3/3-2.png)

## Part 4: Image Size and layer Comparison
![ ](Screenshots/Exp3/4.png)

## Part 5: Using HTML and then cleanup
![ ](Screenshots/Exp3/5.png)
