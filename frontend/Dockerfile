FROM node:20-bullseye
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* /app/
RUN npm install -g pnpm@latest || true
RUN pnpm install || npm install
COPY . /app
EXPOSE 3000
CMD ["pnpm", "dev"]
