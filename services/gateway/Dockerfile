FROM node:18-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY src ./src
EXPOSE 4000
CMD ["npm","start"]
