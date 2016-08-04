"use strict"
const co = require('co')
const models = require('../mysql/index')

let cache = {}

//findConfig()

function findConfig() {
    models.dmd_config
        .findAll()
        .then(c => {
            cache = c
        })

    setTimeout(findConfig, 1000 * 1 * 60)
}

let configCache = {
    cache() {
        if (cache)
            return cache
        else
            return null
    },
    getConfig(id) {
        if (cache[id])
            return cache[id].val
        else
            return null
    }
}
module.exports = configCache
