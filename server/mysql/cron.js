"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const config = require(path.join(__dirname, '..', 'config', 'config.json'))['cronjob'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    timestamps: false,
    logging: true,
    pool: false
})

sequelize
    .authenticate()
    .then(function(err) {
        console.log('Connection has been established successfully.')
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err)
    })

const modelsDir = path.join(__dirname, '../gen_models')

let db = {}

fs
    .readdirSync(modelsDir)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        const modelsFile = path.join(modelsDir, file)
        const model = sequelize.import(modelsFile)
        db[model.name] = model
    })

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db)
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
