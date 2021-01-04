FROM nginx:1.19.6-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY ./var/development/buildbot_config.nginx.conf /etc/nginx/conf.d/default.conf

COPY ./var/development/buildbot_master.cfg /usr/share/nginx/html/buildbot_master.cfg