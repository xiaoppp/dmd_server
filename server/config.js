const configuration = {
    "dev": {
        "username": "root",
        "password": "",
        "database": "dmd_web",
        "host": "192.168.1.107",
        "dialect": "mysql"
    },
    "product": {
        "username": "duomiduo",
        "password": "Duomiduo123!@#",
        "database": "duomiduo2",
        "host": "rm-bp145d8j3uo7306kv.mysql.rds.aliyuncs.com",
        "dialect": "mysql"
    },
    "pagination": {
        "size": 12
    }
}

const env = "dev"
const config = configuration[env]

module.exports = config
