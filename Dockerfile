FROM node:20-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHON_EXECUTABLE=/opt/venv/bin/python \
    NODE_ENV=production

WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        python3 \
        python3-dev \
        python3-venv \
        build-essential \
    && python3 -m venv /opt/venv \
    && /opt/venv/bin/python -m pip install --upgrade pip \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

COPY server/package.json server/package-lock.json ./server/
RUN npm ci --omit=dev --prefix ./server

COPY ml ./ml
COPY server ./server

WORKDIR /app/server
EXPOSE 5000

CMD ["node", "src/server.js"]
