"use strict"
const co = require('co')
const models = require('../mysql/index')

let cache = {}

findConfig()

function findConfig() {
    models.dmd_config
        .findAll()
        .then(c => {
            cache = c
        })

    setTimeout(findConfig, 1000 * 5 * 60)
}

let configCache = {
    getConfig(id) {
        if (cache[id])
            return cache[id].val
        else
            return null
    }
}
module.exports = configCache
