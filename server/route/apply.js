"use strict"
const co = require('co')
const restify = require('restify')
const moment = require('moment')
const models = require('../mysql/index')
const util = require('../util/util')

module.exports = function(server) {
    server.get('/api/applys/:memberid', findMemberApplys)

    server.post('/api/apply/detail', restify.jsonBodyParser(), findApplyDetail)

    server.post('/api/apply/member', restify.jsonBodyParser(), apply)
    server.post('/api/apply/member/check', restify.jsonBodyParser(), checkApply)
}

const findApplyDetail = (req, res, next) => {
    const applyid = req.params.applyid
    const memberid = req.params.memberid
    //const offerMemberid = req.params.omid

    co(function*() {
        let result = {}
        result.apply = yield models.dmd_apply_help.findById(applyid)
        result.pairs = yield models.dmd_offer_apply.findAll({
            where: {
                am_id: memberid,
                aid: applyid
            }
        })

        for (let i = 0; i < result.pairs.length; i++) {
            let item = result.pairs[i]
            let offerMember = yield models.dmd_members.findOne({where:{id:item.om_id},attributes:{exclude:['team_ids']}})
            //result.offerMember = offerMember
            item.setDataValue('offerMember',offerMember)
            if (offerMember.parent_id > 0) {
                let offerMemberParent = yield models.dmd_members.findOne({where:{id:offerMember.parent_id},attributes:{exclude:['team_ids']}})
                item.setDataValue('offerMemberParent',offerMemberParent)
            }
        }
        return result
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(res, error))
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
