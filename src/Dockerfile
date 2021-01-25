FROM python:3.7

COPY requirements.txt .
RUN pip install -r requirements.txt && \
rm requirements.txt

COPY rabbit ./rabbit/

ENTRYPOINT ["gunicorn", "-b", "0.0.0.0:80", "--workers", "8", "rabbit.web:app"]