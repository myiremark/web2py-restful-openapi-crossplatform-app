FROM        buildbot/buildbot-worker:master
MAINTAINER  Buildbot maintainers

ENV NODE_MAX_MEMORY_MB "8192"

ENV NVM_DIR "/root/.nvm"
ENV NODE_VERSION "10.19.0"
ENV NODE_OPTIONS --max-old-space-size="$NODE_MAX_MEMORY_MB"
ENV APT_PROXY_SERVER="http://10.0.2.2:3128"

ARG DEBIAN_FRONTEND=noninteractive

USER root

RUN echo 'Acquire::http { Proxy "$APT_PROXY_SERVER"; };' >> /etc/apt/apt.conf.d/01proxy.conf

RUN apt-get -y update && apt-get install -y curl && curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash ;

RUN [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install $NODE_VERSION && nvm alias default $NODE_VERSION && nvm use $NODE_VERSION

# Manually install client peer dependencies
#
# Note: 
#   We use --unsafe-perm here 
#   because this is mounted inside a Vagrant virtual machine 
#   which has known file system permission issues.
#   short version: you think you're root, but you're not with vagrant mounts

RUN [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && npm install typescript@3.8.3 --unsafe-perm
RUN [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" &&  npm install react@^16.13.0 --unsafe-perm
RUN [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" &&  npm install @ionic/cli -g
RUN [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" &&  npm install node-sass --unsafe-perm

# Install required npm packages


USER root
