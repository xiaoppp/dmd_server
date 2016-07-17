"use strict"
const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')
const util = require('../util/util')
const config = require('../config/config')
const restify = require('restify')
const path = require('path')
const fs = require('fs')
const verifyToken = require('../middlewares/restifyToken')

module.exports = function(server) {
    // 失败匹配
    server.get('/api/pairs/failed',verifyToken, findMemberFailedPairs)

    // 仲裁结果 申请投诉 撤销
    server.post('/api/pairs/judge', verifyToken,restify.jsonBodyParser(), judge)

    server.post('/api/pairs/remark', verifyToken,restify.jsonBodyParser(), remark)

    server.get('/api/pair/payment/deny', verifyToken,denyPayment)

    server.post('/api/pair/payment/mobile/upload', verifyToken,restify.bodyParser({multipartFileHandler: uploadPicture}), upload)

    //打款
    server.post('/api/pair/payment/out', verifyToken,restify.jsonBodyParser(), payOut)
    //收款
    server.post('/api/pair/payment/in', verifyToken,restify.jsonBodyParser(), payIn)
}

const denyPayment = (req, res, next) => {
    const memberid = req.memberid
    models.dmd_members.freezeMember(memberid, "拒绝打款")
        .then(m => util.success(res, m))
        .catch(error => util.fail(req, res, error))
}

const payIn = (req, res, next) => {
    console.log(req.params)
    const oaid = req.params.oaid

    co(function*() {
        const offerApply = yield models.dmd_offer_apply.findOne({
            where: {
                id: oaid,
                state: 3
            }
        })
        console.log(offerApply)
        yield models.dmd_offer_apply.payIn(offerApply)
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(req, res, error))
}

const uploadPicture = (part, req, res, next) => {
    console.log(part)

    const dirs = "/var/www/html/images/payment"
    const filename = part.filename
    const dir = path.join(dirs, filename)
    const writter = fs.createWriteStream(dir)

    if (part.mime === "image/png" || part.mime === "image/jpg" || part.mime === "image/jpeg" || part.mime === "image/gif") {
        part.pipe(writter)
    }
    req.filespath = filename
    console.log(filename)
}

const upload = (req, res, next) => {
    console.log(req.filespath)
    if (req.filespath) {
        util.success(res, req.filespath)
    }else {
        util.fail(req, res, error)
    }
}

const payOut = (req, res, next) => {
    const pairid = req.params.oaid
    const memberid = req.memberid
    const url = req.params.imgurl
    console.log(req.params.oaid)
    console.log(req.memberid)
    console.log(req.params.imgurl)
    co(function*() {
        const pair = yield models.dmd_offer_apply.findOne({
            where: {
                id: pairid,
                om_id: memberid,
                state: 2
            }
        })

        pair.state = 3
        pair.img = url
        pair.pay_time = moment().unix()
        yield pair.save()

        yield models.dmd_payment_log.create({
            oaid: pair.id,
            member_id: pair.om_id,
            to_member_id: pair.am_id,
            money: pair.money,
            the_time: moment().unix(),
            img: req.filespath
        })

        //util.sendSMSForPayment(pair.am_id)

        return pair
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(req, res, error))
}

const findMemberFailedPairs = (req, res, next) => {
    const memberid = req.memberid
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
        .catch(error => util.fail(req, res, error))
}

const judge = (req, res, next) => {
    const oaid = req.params.oaid
    const memberid = req.memberid
    const judge = req.params.judge

    co(function*() {
            const offerapply = yield models.dmd_offer_apply.findById(oaid)
            offerapply.judge = judge
            yield offerapply.save()
        })
        .then(m => util.success(res, m))
        .catch(error => util.fail(req, res, error))
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
        .catch(error => util.fail(req, res, error))
}
