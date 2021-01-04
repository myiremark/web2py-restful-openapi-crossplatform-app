FROM        buildbot/buildbot-master:master
MAINTAINER  mark@myire.com

RUN pip3 install "docker>=2.0"

RUN echo '10.0.2.2 registry.local.myirelabs.com'