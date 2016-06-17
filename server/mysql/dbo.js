"use strict";

const Sequelize = require('sequelize')

console.log("==========duomiduo database init...")

let sequelize = new Sequelize('duomiduo', 'root', '', {
    host: '192.168.1.179',
    dialect: 'mysql',
    timestamps: true,
    pool: {
        max: 20,
        min: 0,
        idle: 10000
    }
})

sequelize
    .authenticate()
    .then(function(err) {
        console.log('Connection has been established successfully.')
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err)
    })

module.exports = sequelize
