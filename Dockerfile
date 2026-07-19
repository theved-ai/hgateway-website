FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Next.js bakes NEXT_PUBLIC_* vars into the client bundle at build time — must be build ARGs,
# not runtime env vars (a container env var set after this point would have no effect).
ARG NEXT_PUBLIC_DOCS_URL
ARG NEXT_PUBLIC_DASHBOARD_URL
ARG NEXT_PUBLIC_DASHBOARD_API_URL
ENV NEXT_PUBLIC_DOCS_URL=$NEXT_PUBLIC_DOCS_URL \
    NEXT_PUBLIC_DASHBOARD_URL=$NEXT_PUBLIC_DASHBOARD_URL \
    NEXT_PUBLIC_DASHBOARD_API_URL=$NEXT_PUBLIC_DASHBOARD_API_URL
RUN npm run build

FROM node:20-slim AS run
WORKDIR /app
ENV NODE_ENV=production
# curl for the release workflow's post-deploy healthcheck.
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
# `output: "standalone"` (next.config.ts) traces only the node_modules the server actually
# needs, so the runtime stage never installs the full dependency tree.
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
