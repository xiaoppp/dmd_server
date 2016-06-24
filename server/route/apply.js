"use strict"
const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')
const util = require('../util/util')

module.exports = function(server) {
    server.post('/api/apply/member', apply)
    server.post('/api/apply/member/check', restify.jsonBodyParser(), checkApply)
}

const checkApply = (req, res, next) => {
    const money = Number(req.params.money)
    const memberid = req.params.memberid

    co(function*() {
        const member = yield models.dmd_members.findById(memberid)
        yield models.dmd_apply_help.checkApply(money, member)
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(res, error))
}

const apply = (req, res, next) => {
    const money = req.params.money
    const memberid = req.params.memberid

    co(function*() {
        const member = yield models.dmd_members.findById(memberid)

        yield models.dmd_apply_help.checkApply(money, member)

        const the_time = moment().unix()
        const apply = yield models.dmd_apply_help.create({
            member_id: member.id,
            money: money,
            the_time: the_time,
            code: "A" + member.id + the_time,
            state: 1,
            type: money
        })

        return apply
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(res, error))
}