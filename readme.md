## start & run
npm start -> it will start nodemon and restart whenever you changed anything

## aliyun nodejs sdk
https://github.com/aliyun-UED/aliyun-sdk-js

for test purpose
- http://localhost:3000
- http://localhost:3000/top/onsaleitems
- http://localhost:3000/user/471745548

## architecture configuration 架构的一些组件
- restful server: node-restify http://restify.com/
- mysql orm -> sequelize: http://docs.sequelizejs.com/en/latest/
- sequelize auto -> generate schema auto : https://github.com/sequelize/sequelize-auto

### how to use babel with node
https://github.com/babel/example-node-server
not add deploy

## project structure
- server/app.js => project start file
- db => mongo
- route => restful route

## deploy
- fly develop -- development
- fly product -- product


## reference 参考文章
- https://zhuanlan.zhihu.com/p/20691602?refer=prattle
- https://zhuanlan.zhihu.com/p/20691649?refer=prattle
- https://zhuanlan.zhihu.com/p/20691777?refer=prattle
- http://mp.weixin.qq.com/s?__biz=MzA3NDM0ODQwMw==&mid=401924543&idx=1&sn=97de2e09c9fddfd905992c19aedb6182&scene=21#wechat_redirect


## issues
- callback hell 的处理

https://www.zhihu.com/question/25413141/answer/71934118
http://www.ruanyifeng.com/blog/2015/05/async.html
http://div.io/topic/1455
http://blog.shaunxu.me/2016-06-14-es7-async-await-in-node-with-bebel/

- How to install mongodb on ubuntu 15.04

https://rohan-paul.github.io/mongodb_in_ubuntu/2015/09/03/How_to_Install_MongoDB_Iin_Ubuntu-15.04.html

## cronjob
https://github.com/ncb000gt/node-cron


## task queue
http://www.jianshu.com/p/16e6c3803f56
https://cnodejs.org/topic/5577b493c4e7fbea6e9a33c9
https://github.com/node-schedule/node-schedule
http://blog.fens.me/nodejs-cron-later/

## sequelize auto
sequelize-auto -o "./gen_models" -h rm-bp145d8j3uo7306kv.mysql.rds.aliyuncs.com -d duomiduo -u duomiduo -p Duomiduo123!@# 3306 --dialect mysql
