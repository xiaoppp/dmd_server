"use strict"
const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')
const util = require('../util/util')
const config = require('../config/config')
const restify = require('restify')

module.exports = function(server) {
    // 失败匹配
    server.get('/api/pairs/failed/:memberid', findMemberFailedPairs)

    // 仲裁结果 申请投诉 撤销
    server.post('/api/pairs/judge', restify.jsonBodyParser(), judge)

    server.post('/api/pairs/remark', restify.jsonBodyParser(), remark)

    server.get('/api/pair/payment/deny/:memberid', denyPayment)

    //打款
    server.post('/api/pair/payment/out', restify.jsonBodyParser(), payOut)
        //收款
    server.post('/api/pair/payment/in', restify.jsonBodyParser(), payIn)
}

const denyPayment = (req, res, next) => {
    const memberid = req.params.memberid
    models.dmd_members.freezeMember(memberid, "拒绝打款")
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}

const payIn = (req, res, next) => {
    const oaid = req.params.oaid
    const memberid = req.params.memberid

    models.dmd_members.payIn(oaid, memberid)
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}

const payOut = (req, res, next) => {
    const pairid = req.params.pairid
    const memberid = req.params.memberid
    co(function*() {
        const pair = yield models.dmd_offer_apply.findOne({
            where: {
                id: pairid,
                om_id: memberid,
                state: 2
            }
        })
    })
}

const findMemberFailedPairs = (req, res, next) => {
    const memberid = req.params.memberid
    co(function*() {
            const member = yield models.dmd_members.findById(memberid)
            const orderby = member.type == 1 ? ['state', 'asc'] : ['the_time', 'desc']
            const pairs = yield models.dmd_unmatch_log.findAll({
                where: {
                    om_id: memberid,
                    am_id: memberid
                },
                order: [
                    orderby
                ]
            })
            return yield pairs.map(function*(p) {
                const apply = yield models.members.findOne({
                    where: {
                        id: p.om_id
                    }
                })
                const offer = yield models.members.findOne({
                    where: {
                        id: p.am_id
                    }
                })
                return {
                    pair: p,
                    apply: apply,
                    offer: offer
                }
            })
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}

const judge = (req, res, next) => {
    const oaid = req.params.oaid
    const memberid = req.params.memberid
    const judge = req.params.judge

    co(function*() {
            const offerapply = yield models.dmd_offer_apply.findById(oaid)
            offerapply.judge = judge
            yield offerapply.save()
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}

const remark = (req, res, next) => {
    const oaid = req.params.oaid
    const remark = req.params.remark
    const omid = req.params.omid

    co(function*() {
            const offerapply = yield models.dmd_offer_apply.findById(oaid)
            offerapply.remark = remark
            offerapply.save()

            const count = yield models.dmd_offer_apply.count({
                where: {
                    om_id: omid,
                    remark: {
                        $gt: 0
                    }
                }
            })
            const sum = yield models.dmd_offer_apply.sum('remark', {
                where: {
                    om_id: omid,
                    remark: {
                        $gt: 0
                    }
                }
            })
            const member = yield models.dmd_members.findById(omid)
            member.believe = math.round(sum / count)
            yield member.save()
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(res, error))
}
