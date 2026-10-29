FROM node:24.12.0-bookworm-slim@sha256:7326fb2dbdce998edd72140946851be64ef4a643e8715e138ca467e8e9d92c99 AS build
RUN npm install --global npm@11.6.2
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
RUN npm run build

FROM build AS verification
COPY eslint.config.js vitest.config.ts playwright.config.ts ./
COPY tests ./tests
RUN npm run lint && npm run typecheck
CMD ["npm", "run", "test:component"]

FROM nginx:1.30.6-alpine@sha256:0e52bd054126cdc040b1276c0af347aeb02a41b9cfe305d6094767ac30e97949 AS runtime
COPY deploy/nginx-main.conf /etc/nginx/nginx.conf
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
STOPSIGNAL SIGQUIT
HEALTHCHECK --interval=5s --timeout=3s --retries=15 CMD wget -q -O /dev/null http://127.0.0.1:8080/
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
