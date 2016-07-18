# deploy guide

1. install nodejs

  - curl -sL <https://deb.nodesource.com/setup_6.x> | sudo -E bash -
  - sudo apt-get install -y nodejs

    - install pm2 sudo npm install pm2 -g

2. import mysql database into rds

3. install nginx

  - sudo -s
  - nginx=stable # use nginx=development for latest development version
  - add-apt-repository ppa:nginx/$nginx
  - apt-get update
  - apt-get install nginx

    - config nginx vim /etc/nginx/sites-available/default reference nginx_config
