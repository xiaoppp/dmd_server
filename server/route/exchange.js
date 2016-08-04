"use strict"
const co = require('co')
const moment = require('moment')
const restify = require('restify')
const models = require('../mysql/index')
const util = require('../util/util')
const config = require('../config')
const verifyToken = require('../middlewares/restifyToken')

module.exports = function(server) {
    server.get('/exchange/v1/member/coins/:mobile', queryCoin)
    server.get('/exchange/v1/member/coin/reduce/:mobile/:reduce', reduceCoin)
}

const queryCoin = (req,res,next) => {
    console.log(req.body)
    const username = req.params.mobile
    co(function*() {
        const member = yield models.dmd_members.findOne({
                where: {
                    username: username
                }
            })
        console.log(member.dmd_coin)
        return member.dmd_coin
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(req, res, error))
}

const reduceCoin = (req,res,next) => {
    const username = req.params.mobile
    const reduce = req.params.reduce
    console.log(reduce)
    co(function*() {
        const member = yield models.dmd_members.findOne({
                where: {
                    username: username
                }
            })
        member.dmd_coin = member.dmd_coin - reduce
        member.save()
        return member.dmd_coin
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(req, res, error))
}
