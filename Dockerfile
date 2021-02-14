FROM node:latest

WORKDIR /app
COPY rabbit-react/package.json .

RUN npm install

COPY rabbit-react/tsconfig.json .
COPY rabbit-react/public ./public
COPY rabbit-react/src ./src

RUN npm run build

FROM python:3.7

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt && \
rm requirements.txt

COPY rabbit ./rabbit
COPY --from=0 /app/build ./rabbit/web/build

ENTRYPOINT ["gunicorn", "--access-logfile", "-", "-b", "0.0.0.0:80", "--workers", "8", "rabbit.web:app"]
