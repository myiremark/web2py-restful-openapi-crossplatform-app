#! /bin/bash

export WORKON_HOME=$HOME/.virtualenvs
source ~/Library/Python/2.7/bin/virtualenvwrapper.sh;

workon crossplatform;

cd ../server/web2py/

python web2py.py -i 0.0.0.0 -a 'mark' -p 9999;

