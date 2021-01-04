# -*- mode: ruby -*-
# vi: set ft=ruby :

# WARNING: THIS IS INTENDED TO BE RUN ON A VIRTUAL MACHINE.

# DO NOT JUST COPY THIS SCRIPT AND RUN THIS SCRIPT ON YOUR LOCAL MACHINE.

# IT CATS SSH KEYS INTO authorized_keys

USE_APT_PROXY = true
USE_APT_CACHE = true
APT_CACHE_HOST_DIR = "/opt/SPADevCluster"

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

# Node complains about too many open files otherwise
sysctl -w fs.inotify.max_user_watches=524288

NODE_MAX_MEMORY_MB="8192"

export NVM_DIR="/root/.nvm"
export NODE_VERSION="10.19.0"
export NODE_OPTIONS=--max-old-space-size="$NODE_MAX_MEMORY_MB"

export DEBIAN_FRONTEND=noninteractive

sudo apt-get update;

# install dev utilities

sudo apt-get install -y curl gnupg2 ca-certificates jq unzip;

# install pip (python)
sudo apt-get install -y python-pip


/opt/src/bin/docker/install_docker_ubuntu_18.sh

# Install nvm, node, and npm -- bad practice to pipe a script here.  do so at your own risk

/opt/src/bin/node/install_nvm.sh

# Install typescript, peer dependencies, and package.json

export CLIENT_PROJECT_BASE_PATH="/opt/src";

#/opt/src/bin/node/install_dev_web_client.sh

# Install server side dev requirements (fabric, docker-compose)

sudo pip install --upgrade pip;

echo "export WORKON_HOME=/opt/virtualenvs;source /usr/local/bin/virtualenvwrapper.sh;">>/root/.bashrc
pip install virtualenvwrapper;
export WORKON_HOME=/opt/virtualenvs;
source /usr/local/bin/virtualenvwrapper.sh
mkvirtualenv spa;
workon spa;

/opt/src/bin/install_server_side_dev_requirements.sh

cd /opt/src/vendor;

#wget https://mdipierro.pythonanywhere.com/examples/static/web2py_src.zip;

unzip -o web2py_src.zip;



# in dev on a vm, lets do everything as root to avoid permissions issues
sudo cat /home/vagrant/.ssh/authorized_keys >> /root/.ssh/authorized_keys

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
