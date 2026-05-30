FROM node:22-bullseye

WORKDIR /app

ENV NODE_ENV=development

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json apps/web/package.json

RUN corepack enable && corepack prepare pnpm@8.8.0 --activate && pnpm install --no-frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["pnpm", "--filter", "@agentbridge/web", "dev"]