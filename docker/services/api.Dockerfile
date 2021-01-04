FROM python:2.7.18-stretch

RUN pip install psycopg2

COPY ./vendor/web2py /opt/web2py

COPY ./src/server/web2py/applications/api/requirements.txt /tmp/app-requirements.txt

RUN pip install -r /tmp/app-requirements.txt