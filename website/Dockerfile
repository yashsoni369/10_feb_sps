FROM node:14.18.0-alpine as builder
RUN mkdir -p app

WORKDIR /app

COPY package*.json /app/

RUN apk add bash vim curl

RUN npm install
COPY ./ /app/
RUN npm run build:prod

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
# When the container starts, replace the env.js with values from environment variables
# CMD ["exec nginx -g 'daemon off;'"]
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]