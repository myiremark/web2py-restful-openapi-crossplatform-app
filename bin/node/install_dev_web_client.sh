#!/bin/bash


cd $CLIENT_PROJECT_BASE_PATH;

# Ensure NVM is loaded.
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# Load Bash Completion
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Install dev web client

cd src/client/ionic;

# make sure node is not memory limited

export NODE_OPTIONS=--max-old-space-size="$NODE_MAX_MEMORY_MB"

# Manually install client peer dependencies
#
# Note: 
#   We use --unsafe-perm here 
#   because this is mounted inside a Vagrant virtual machine 
#   which has known file system permission issues.
#   short version: you think you're root, but you're not with vagrant mounts

npm install typescript@3.8.3 --unsafe-perm
npm install react@^16.13.0 --unsafe-perm
npm install @ionic/cli -g
npm install node-sass --unsafe-perm

# install client libraries

npm install --unsafe-perm