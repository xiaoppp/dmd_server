"use strict"
const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')
const util = require('../util/util')
const restify = require('restify')

module.exports = function(server) {
    server.get('/api/offers/:memberid', findMemberOffers)

    server.post('/api/offer/detail', restify.jsonBodyParser(), findOfferDetail)

    server.post('/api/offer/member', restify.jsonBodyParser(), offer)
    //查看是否可以播种
    server.post('/api/offer/member/check', restify.jsonBodyParser(), checkOffer)
}

const findMemberOffers = (req, res, next) => {
    const memberid = req.params.memberid
    co(function*() {
        const member = yield models.dmd_members.findById(memberid)
        const orderby = member.type == 1 ? ['state', 'asc'] : ['the_time', 'desc']
        const result = {}
        const offers = yield models.dmd_offer_help.findAll({
            where: {
                member_id: memberid
            },
            order: [
                orderby
            ]
        })

        return yield offers.map(function*(o) {
            const count = yield models.dmd_offer_apply.count({
                where: {
                    oid: o.id
                }
            })
            o.setDataValue('pct',count)
            return o
        })
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(req, res, error))
}

const findOfferDetail = (req, res, next) => {
    const offerid = req.params.offerid
    const memberid = req.params.memberid
    //const applyMemberid = req.params.amid

    co(function*() {
        let result = {}
        result.offer = yield models.dmd_offer_help.findById(offerid)
        result.pairs = yield models.dmd_offer_apply.findAll({
            where: {
                om_id: memberid,
                oid: offerid
            }
        })

        for (let i = 0; i < result.pairs.length; i++) {
            let item = result.pairs[i]
            //const applyMember = yield models.dmd_members.findById(applyMemberid)
            const applyMember = yield models.dmd_members.findOne({where:{id:item.am_id},attributes:{exclude:['team_ids']}})
            item.setDataValue('applyMember',applyMember)
            if (applyMember.parent_id > 0) {
                let applyMemberParent = yield models.dmd_members.findOne({where:{id:applyMember.parent_id},attributes:{exclude:['team_ids']}})
                item.setDataValue('applyMemberParent',applyMemberParent)
            }
        }
        return result
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(req, res, error))
}

const checkOffer = (req, res, next) => {
    const money = Number(req.params.money)
    const memberid = req.params.memberid

    co(function*() {
        const member = yield models.dmd_members.findById(memberid)
        const lastoffer = yield models.dmd_offer_help.findOne({where:
            {
                member_id: member.id
            },
            order: [
                ['the_time', 'desc']
            ]
        })
        yield models.dmd_offer_help.checkOffer(money, member, lastoffer)
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(res, error))
}

const offer = (req, res, next) => {
    const money = Number(req.params.money)
    const memberid = req.params.memberid

    co(function*(){
        const member = yield models.dmd_members.findById(memberid)
        // 查最后一单
        const lastoffer = yield models.dmd_offer_help.findOne({
            where: {
                member_id: memberid
            },
            order: [
                ['the_time', 'DESC']
            ]
        })
        yield models.dmd_offer_help.checkOffer(money, member, lastoffer)
        const offer = yield addOffer(money, member)

        if (lastoffer.state < 100 && member.the_time < member.reg_time) { //首单
            yield addFirstOffer(money, member, lastoffer)
        }
        return offer
    })
    .then(m => util.success(res, m))
    .catch(error => util.fail(req, res, error))
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
        return offer
    })
}
