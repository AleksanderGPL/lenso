FROM denoland/deno:debian-2.3.6

WORKDIR /app

COPY . .

RUN deno install --allow-scripts=npm:sharp

EXPOSE 8000

CMD ["task", "start"]