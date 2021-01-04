FROM        buildbot/buildbot-worker:master
MAINTAINER  mark@myire.com

ENV NODE_MAX_MEMORY_MB "8192"
ENV SHELL /bin/bash
ENV NVM_DIR "/root/.nvm"
ENV NODE_VERSION "10.19.0"
ENV NODE_OPTIONS --max-old-space-size="$NODE_MAX_MEMORY_MB"
ENV APT_PROXY_SERVER="http://10.0.2.2:3128"

ARG DEBIAN_FRONTEND=noninteractive

USER root

RUN echo 'Acquire::http { Proxy "$APT_PROXY_SERVER"; };' >> /etc/apt/apt.conf.d/01proxy.conf

RUN apt-get -y update && apt-get install -y curl software-properties-common;

RUN add-apt-repository universe;

RUN apt-get install -y python2-dev;

RUN curl https://bootstrap.pypa.io/get-pip.py --output get-pip.py

RUN python2 get-pip.py

RUN pip2 install pytest

COPY ./vendor/web2py /opt/web2py
COPY ./src/server/web2py/applications/api /opt/web2py/applications/api

COPY ./src/server/web2py/applications/api/requirements.txt /tmp/app-requirements.txt

RUN pip2 install -r /tmp/app-requirements.txt

USER root
