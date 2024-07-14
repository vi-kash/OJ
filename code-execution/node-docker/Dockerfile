# node-docker/Dockerfile

FROM node:latest
WORKDIR /code
COPY . .
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]
