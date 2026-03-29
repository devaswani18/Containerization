FROM postgres:15-alpine

ENV POSTGRES_DB=taskdb
ENV POSTGRES_USER=appuser
ENV POSTGRES_PASSWORD=securepassword

COPY init.sql /docker-entrypoint-initdb.d/