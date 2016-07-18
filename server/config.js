const configuration = {
    "dev": {
        "username": "root",
        "password": "",
        "database": "dmd20160709",
        "host": "192.168.1.105",
        "dialect": "mysql"
    },
    "product": {
        "username": "duomiduo",
        "password": "Duomiduo123!@#",
        "database": "duomiduo1",
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
