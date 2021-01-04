#! /bin/bash

cd /opt/src

REGISTRY_HOST="127.0.0.1:25000"

docker build -t $REGISTRY_HOST/infra-controller:0.0.1 -f ./docker/services/infra-controller.Dockerfile .
docker build -t $REGISTRY_HOST/buildbot_worker_front_end:0.0.1 -f ./docker/services/buildbotClientBuilderWorker.Dockerfile .
docker build -t $REGISTRY_HOST/buildbot_master:0.0.1 -f ./docker/services/buildbotMaster.Dockerfile .
docker build -t $REGISTRY_HOST/buildbot_config:0.0.1 -f ./docker/services/buildbotConfig.Dockerfile .