FROM node:23 as builder

WORKDIR /app
COPY . .
RUN npm install


FROM nginx

COPY --from=builder /app/ /usr/share/nginx/html
