## start & run
npm start -> it will start nodemon and restart whenever you changed anything

for test purpose
- http://localhost:3000
- http://localhost:3000/top/onsaleitems
- http://localhost:3000/user/471745548

## architecture configuration 架构的一些组件
- restful server: node-restify http://restify.com/
- mysql orm -> sequelize: http://docs.sequelizejs.com/en/latest/
- sequelize auto -> generate schema auto : https://github.com/sequelize/sequelize-auto
- mongo: mongoose

### how to use babel with node
https://github.com/babel/example-node-server
not add deploy

## project structure
- server/app.js => project start file
- db => mongo
- route => restful route


## reference 参考文章
- https://zhuanlan.zhihu.com/p/20691602?refer=prattle
- https://zhuanlan.zhihu.com/p/20691649?refer=prattle
- https://zhuanlan.zhihu.com/p/20691777?refer=prattle


## issues
- callback hell 的处理

https://www.zhihu.com/question/25413141/answer/71934118

- How to install mongodb on ubuntu 15.04

https://rohan-paul.github.io/mongodb_in_ubuntu/2015/09/03/How_to_Install_MongoDB_Iin_Ubuntu-15.04.html

## sequelize auto
sequelize-auto -o "./gen_models" -h 192.168.1.103 -d duomiduo -u root -p 3306 --dialect mysql
