FROM node:22-alpine AS build
WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
COPY deploy/config.template.js /usr/share/nginx/html/config.template.js
COPY --from=build /workspace/dist/sys-venta-papas-ctf/browser /usr/share/nginx/html
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=4 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/health || exit 1
