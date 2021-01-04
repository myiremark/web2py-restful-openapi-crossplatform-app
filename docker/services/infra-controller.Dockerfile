FROM ubuntu:18.04

MAINTAINER "Mark Graves <mark@myire.com>"

ENV TF_VERSION="0.14.3"

ENV APT_PROXY_SERVER="http://10.0.2.2:3128"

RUN echo 'Acquire::http { Proxy "$APT_PROXY_SERVER"; };' >> /etc/apt/apt.conf.d/01proxy.conf

RUN apt-get update -y && apt-get install -y unzip wget curl git jq software-properties-common python3 python3-pip && pip3 install --upgrade pip;

RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add -

RUN apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com xenial main"

RUN apt-get install terraform=${TF_VERSION}

RUN terraform -install-autocomplete

RUN cd /tmp && wget https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip && unzip awscli-exe-linux-x86_64.zip && /tmp/aws/install

RUN echo 'eval $(ssh-agent) && ssh-add /root/.ssh/id_rsa;' >> /root/.bashrc
