"use strict"
const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')
const util = require('../util/util')

module.exports = function(server) {
    server.post('/api/member/edit/info', test)
}

const test = () => {}
