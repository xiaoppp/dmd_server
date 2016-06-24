"use strict"
const co = require('co')
const models = require('../mysql/index')

let configCache = {}

setTimeout(findConfig, 1000 * 5 * 60)

function findConfig() {
    models.dmd_config
        .findAll()
        .then(c => {
            configCache = c
            //console.log(configCache)
            console.log(configCache[0].val)
        })
}

module.exports = configCache
