# Frontend Dockerfile - Node.js
FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 如果是开发环境，使用 dev
# CMD ["npm", "run", "dev", "--", "--host"]

# 如果是生产环境，先 build 再用 preview
RUN npm run build
EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "--port", "4173"]
