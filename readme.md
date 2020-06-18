This repo contains code licensed under more than one license.

web2py has its own license at:

server/web2py/LICENSE.

api application located at:

server/web2py/applications/api/*

has is licensed according to this repo

TODO: build process and remove web2py from repo for clarity

docker run -p 8080:8080  -e SWAGGER_JSON=/api/swagger.json -v ./api:/api swaggerapi/swagger-ui;
