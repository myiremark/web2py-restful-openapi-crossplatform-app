#! /bin/bash

REGISTRY_HOST="10.0.0.2:25000"

docker pull $REGISTRY_HOST/nginx:alpine;
docker pull $REGISTRY_HOST/postgres:9.6;
docker pull $REGISTRY_HOST/buildbot/buildbot-worker:master;
docker pull $REGISTRY_HOST/buildbot/buildbot-master:master;
docker pull $REGISTRY_HOST/registry:2;
docker pull $REGISTRY_HOST/swaggerapi/swagger-editor:v3.14.8;

docker pull $REGISTRY_HOST/ubuntu:18.04;

docker pull $REGISTRY_HOST/python:2.7.18-stretch;
