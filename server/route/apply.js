"use strict"
const co = require('co')
const restify = require('restify')
const moment = require('moment')
const models = require('../mysql/index')
const util = require('../util/util')

module.exports = function(server) {
    server.get('/api/applys/:memberid', findMemberApplys)

    server.post('/api/applys/detail', restify.jsonBodyParser(), findApplyDetail)

    server.post('/api/apply/member', restify.jsonBodyParser(), apply)
    server.post('/api/apply/member/check', restify.jsonBodyParser(), checkApply)
}

const findApplyDetail = (req, res, next) => {

}

const findMemberApplys = (req, res, next) => {
    const memberid = req.params.memberid
    co(function*() {
        const member = yield models.dmd_members.findById(memberid)
        const orderby = member.type == 1 ? ['state', 'asc'] : ['the_time', 'desc']
        const applys = yield models.dmd_apply_help.findAll({
            where: {
                member_id: memberid
            },
            order: [
                orderby
            ]
        })

        return yield applys.map(function*(a) {
            const count = yield models.dmd_offer_apply.count({
                where: {
                    aid: a.id
                }
            })
            return {
                apply: a,
                pct: count
            }
        })
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(res, error))
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
    const money = Number(req.params.money)
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
