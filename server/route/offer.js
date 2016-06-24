"use strict"
const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')
const util = require('../util/util')

module.exports = function(server) {
    server.post('/api/offer/member', restify.jsonBodyParser(), offer)
    server.post('/api/offer/member/check', restify.jsonBodyParser(), checkOffer)
}

const checkOffer = (req, res, next) => {
    const money = Number(req.params.money)
    const memberid = req.params.memberid

    co(function*() {
        const member = yield models.dmd_members.findById(memberid)
        yield models.dmd_offer_help.checkOffer(money, member)
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(res, error))
}

const offer = (req, res, next) => {
    const money = req.params.money
    const memberid = req.params.memberid

    co(function*(){
        const member = yield models.dmd_members.findById(memberid)
        // 查最后一单
        const lastoffer = yield dmd_offer_help.findOne({
            where: {
                member_id: memberid
            },
            order: [
                ['the_time', 'DESC']
            ]
        })
        yield models.dmd_apply_help.checkOffer(money, member, lastoffer)
        yield addOffer(money, member)

        if (offer.state < 100 && member.the_time < member.reg_time) { //首单
            yield addFirstOffer(money, member, lastoffer)
        }
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(res, error))
}

function addFirstOffer(money, member, offer) {
    return co(function*() {
        const members = yield models.dmd_members.find({ //查找一个内部会员
            where: {
                id: member.id,
                type: 1,
                state: 1
            }
        })
        const ran = util.getRandomInt(0, members.length)
        const offerMember = members[ran]

        const the_time = moment().unix()

        const apply = yield models.dmd_apply_help.create({
            member_id: offerMember.id,
            money: money,
            the_time: the_time,
            code: "A" + offerMember.id + the_time,
            type: "money"
        })

        const pair = yield models.dmd_offer_apply.create({
            the_time: the_time,
            code: "OA" + member.id + offerMember.id + the_time,
            oid: offer.id,
            aid: apply.id,
            om_id: member.id,
            am_id: offerMember.id,
            money: money
        })

        offer.state = 2
        offer.fst = 1
        yield offer.save()

        apply.state = 2
        yield apply.save()
    })
}

function addOffer(money, member) {
    const the_time = moment().unix()

    return co(function*() {
        const offer = yield models.dmd_offer_help.create({
            member_id: member.id,
            money: money,
            the_time: the_time,
            code: "O" + member.id + the_time,
            state: 1
        })
    })
}
