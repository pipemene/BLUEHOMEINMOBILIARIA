FROM node:18-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY src ./src
EXPOSE 4002
CMD ["npm","start"]
