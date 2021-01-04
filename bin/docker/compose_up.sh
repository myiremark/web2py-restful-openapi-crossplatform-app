cd /opt/src

export REGISTRY_HOST="10.0.2.2:25000"

docker-compose -f /opt/src/docker/compose/development/registry.yml --project-directory . up -d;
docker-compose -f /opt/src/docker/compose/development/db.yml --project-directory . up -d;
docker-compose -f /opt/src/docker/compose/development/api.yml --project-directory . up -d;

docker-compose -f /opt/src/docker/compose/development/buildbot.yml --project-directory . up -d;
docker-compose -f /opt/src/docker/compose/development/infra-controller.yml --project-directory . up -d;

docker-compose -f /opt/src/docker/compose/development/swagger-editor.yml --project-directory . up -d;