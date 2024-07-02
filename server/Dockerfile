FROM node:18-alpine
WORKDIR /app
RUN apk update && apk add --no-cache g++
COPY package.json .
RUN npm i
COPY . .
EXPOSE 8000
CMD ["node", "index.js"]