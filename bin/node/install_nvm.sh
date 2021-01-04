#!/bin/bash

# Install nvm, node, and npm -- bad practice to pipe a script here.  do so at your own risk

sudo curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash ;

[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install $NODE_VERSION && nvm alias default $NODE_VERSION && nvm use $NODE_VERSION
