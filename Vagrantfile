# -*- mode: ruby -*-
# vi: set ft=ruby :

# WARNING: THIS IS INTENDED TO BE RUN ON A VIRTUAL MACHINE.

# DO NOT JUST COPY THIS SCRIPT AND RUN THIS SCRIPT ON YOUR LOCAL MACHINE.

# IT CATS SSH KEYS INTO authorized_keys

USE_APT_PROXY = false
USE_APT_CACHE = false
APT_CACHE_HOST_DIR = ""

DEV_BOX_NAME = "development"
DEV_BOX_CLUSTER = "SPADevCluster"

dev_box_opts = {
    :name => DEV_BOX_NAME,
    :type => "node",
    :box => "ubuntu/xenial64",
    :box_version => "20180831.0.0",
    :eth1 => "192.168.205.21",
    :mem => "16384",
    :cpu => "4"
}

$configureAPTProxy = <<-SCRIPT
cat <<EOF | sudo tee /etc/apt/apt.conf.d/01proxy.conf
Acquire::http::proxy "http://10.0.2.2:3128";
EOF
SCRIPT

$configureDevBox = <<-SCRIPT

echo "Bootstrapping development box"

NODE_MAX_MEMORY_MB="8192"

export NVM_DIR="/root/.nvm"
export NODE_VERSION="10.19.0"
export NODE_OPTIONS=--max-old-space-size="$NODE_MAX_MEMORY_MB"

export DEBIAN_FRONTEND=noninteractive

sudo apt-get update;

# install dev utilities

sudo apt-get install -y curl gnupg2 ca-certificates jq;

# install pip (python)
sudo apt-get install -y python-pip

# install docker (17.03)

apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") $(lsb_release -cs) stable"
apt-get update && apt-get install -y docker-ce=$(apt-cache madison docker-ce | grep 17.03 | head -1 | awk '{print $3}') docker-compose

# Install nvm, node, and npm -- bad practice to pipe a script here.  do so at your own risk

sudo curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash ;

[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install $NODE_VERSION && nvm alias default $NODE_VERSION && nvm use $NODE_VERSION

# Node complains about too many open files otherwise
sysctl -w fs.inotify.max_user_watches=524288

# do this again after install to make sure root shell has this

# Ensure NVM is loaded.
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# Load Bash Completion
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Install dev web client

cd /opt/src/client/ionic;

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

sudo pip install --upgrade pip;

# install dev-requirements (peer dependencies for python)

cd /opt/src;

sudo pip install -r dev-requirements.txt

cd server/web2py

sudo pip install -r requirements.txt

echo "NOTE: if docker-compose is not working:"
echo "you may need to"
echo "pip uninstall pyopenssl"
echo "then"
echo "pip install pyopenssl"

# in dev on a vm, lets do everything as root to avoid permissions issues
sudo cat /home/vagrant/.ssh/authorized_keys >> /root/.ssh/authorized_key

SCRIPT

Vagrant.configure("2") do |config|

    config.vm.define "#{DEV_BOX_NAME}" do |config|
        config.vm.box = dev_box_opts[:box]
        config.vm.box_version = dev_box_opts[:box_version]
        config.vm.hostname = dev_box_opts[:name]
        config.vm.network :private_network, ip: dev_box_opts[:eth1]

        config.vm.provider "virtualbox" do |v|
            v.name = "#{DEV_BOX_NAME}"
            v.customize ["modifyvm", :id, "--groups", "/#{DEV_BOX_CLUSTER}"]
            v.customize ["modifyvm", :id, "--memory", dev_box_opts[:mem]]
            v.customize ["modifyvm", :id, "--cpus", dev_box_opts[:cpu]]
        end

        if USE_APT_CACHE  
           config.vm.synced_folder "#{APT_CACHE_HOST_DIR}", "/var/cache/apt", owner: "root", group: "root"
        end

        if USE_APT_PROXY
            config.vm.provision "shell", inline: $configureAPTProxy
        end

        config.vm.synced_folder "./", "/opt/src", owner: "root", group: "root"
        config.vm.provision "shell", inline: $configureDevBox

    end

end 
