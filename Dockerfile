# ---- Build ----
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---- Production ----
FROM node:20-alpine AS production
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

# uploads 디렉토리 생성 (Railway는 에페머럴 — 파일 영구 보존은 추후 S3 연동 필요)
RUN mkdir -p uploads logs

EXPOSE 3000
CMD ["node", "dist/main"]
