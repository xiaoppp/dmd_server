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
    co(function*() {
        const offerApply = yield models.dmd_offer_apply.findOne({
            where: {
                id: oaid,
                am_id: memberid,
                state: 3
            }
        })

        offerApply.state = 4
        offerApply.ent_time = moment().unix()
        offerApply.save()

        const om = yield models.dmd_members.findById(offerApply.om_id)
        const am = yield models.dmd_members.findById(offerApply.am_id)

        //完成收获
        const apply = yield models.dmd_apply_help.findById(offerApply.aid)
        yield finishApply(apply, am, offerApply)

        //完成播种
        const offer = yield models.dmd_offer_help.findById(offerApply.oid)
        yield finishOffer(offer, om, offerApply)

        if (offer.fst === 0) {
            //发放阶梯奖
            yield send_step_award()
        }
    })
}

function send_interest(member, offer) {
    return co(function*() {
        const conf6 = models.dmd_config.getConfig(6) //0.05 日利息
        const conf10 = models.dmd_config.getConfig(10) //30 利息计算最多天数，超出则不再计利息
        const conf27 = models.dmd_config.getConfig(27) //老会员下单间隔天数，超出不下单则不再获得奖金
        const conf28 = models.dmd_config.getConfig(28) //冻结二代以上奖金天数

        const day = Math.ceil((moment().unix() - offer.the_time) / (60 * 60 * 24))

        const from_time = moment().format('MM/DD/YYYY') + " " + moment.unix(offer.the_time).format("hh:mm:ss")
        day = from_time >= moment().format("MM/DD/YYYY hh:mm:ss") ? day : day - 1

        day = day < 1 ? 1 : day
        day = day >= conf10 ? conf10 : day

        const interest = offer.money * Number(conf6) * day

        member.interest = member.interest + interest
        member.last_interest_time = moment().unix()
        yield member.save()

        yield models.dmd_income.create({
            member_id: member.id,
            type: "interest",
            money: interest,
            intro: "成功播种￥" + offer.money + "元，获得￥" + interest + "元利息",
            offer_id: offer.id,
            the_time: moment().unix()
        })
    })
}

function send_team_bonus(member, offer) {
    return co(function*() {
        const parents = yield models.dmd_members.findAllParents(member.id)
        const conf27 = models.dmd_config.getConfig(27)
        const conf28 = models.dmd_config.getConfig(28)
        for (let i = 0; i < parents.length; i++) {
            let parent = parents[i]

            parent.rank = parent.rank === 0 ? 1 : parent.rank
            const rank = models.dmd_config.getConfig(parent.rank + 15)
            const rankList = rank.split('-') //20-200-0.1-0.05-0.03-0.01-0.005-0.003-0.001-0.0001
            let bonus = 0

            if (i === 0) {
                const poffer = yield models.dmd_offer_help.findOne({
                    where: {
                        member_id: parent.id
                    },
                    order: [
                        ['the_time', 'DESC']
                    ]
                })
                if (poffer)
                    bonus = poffer.money >= offer.money ? offer.money * rankList[2] : poffer.money * rankList[2]
            }
            if (i === 1 && parent.rank >= 2) {
                bonus = offer.money * Number(rankList[3])
            }
            if (i === 2 && parent.rank >= 3) {
                bonus = offer.money * Number(rankList[4])
            }
            if (i === 3 && parent.rank >= 4) {
                bonus = offer.money * Number(rankList[5])
            }
            if (i >= 4 && parent.rank >= 5) {
                if (i === 4) {
                    bonus = offer.money * Number(rankList[6])
                }
                else if (i === 5) {
                    bonus = offer.money * Number(rankList[7])
                }
                else if (i === 6) {
                    bonus = offer.money * Number(rankList[8])
                }
                else if (i === 7) {
                    bonus = offer.money * Number(rankList[9])
                }
            }

            if (bonus > 0) {
                const offer = yield models.dmd_offer_help.findOne({
                    where: {
                        member_id: parent.id,
                        the_time: {
                            $gt: moment().unix() - 60*60*24*conf27
                        }
                    },
                    order: [
                        ['the_time', 'DESC']
                    ]
                })
                if (offer) {
                    const istr = ""
                    if (i == 0) {
                        parent.bonus = parent.bonus + bonus
                        yield parent.save()
                    }
                    else {
                        istr = "奖金冻结" + conf28 + "天后自动计入奖金余额。"
                    }
                    yield dmd_income.create({
                        member_id: parent.id,
                        type: "bonus",
                        money: bonus,
                        intro: "您的第" + (i+1) + "级下属 " + member.nickname + " 成功播种￥" + offer.money + "元，奖励您￥" + bonus + "元。" + istr,
                        offer_id: offer.id,
                        the_time: moment().unix()
                    })
                }
            }
        }
    })
}

function send_step_award() {
    return co(function*() {

    })
}



// 从个人钱包中减去 收紧金额
// 从奖金开始扣，不够扣利息，不够扣本金
// 完成收获总单
function finishApply(apply, applyMember, offerApply) {
    return co(function*() {
        const applySum = yield models.dmd_offer_apply.sum('money', {
            where: {
                aid: offerApply.aid,
                state: 4
            }
        })

        //总单全部完成
        if (apply.money === applySum) {
            apply.state = 100
            apply.end_time = moment().unix()
            yield apply.save()

            if (applyMember.bonus > apply.money) {
                const bonus_new = applyMember.bonus - apply.money
                yield buildIncome(0, apply, applyMember.id, apply.money, 0, 0)
                applyMember.bonus = bonus_new
            } else if (applyMember.bonus + applyMember.interest > apply.money) {
                const interest_new = applyMember.bonus + applyMember.interest - apply.money
                yield buildIncome(0, apply, applyMember.id, apply.bonus, 0, 0)
                yield buildIncome(1, apply, applyMember.id, 0, apply.money - applyMember.bonus, 0)
                applyMember.bonus = 0
                applyMember.interest = interest_new
            } else if (applyMember.bonus + applyMember.interest + applyMember.money > apply.money) {
                const money_new = applyMember.bonus + applyMember.interest + applyMember.money - apply.money
                yield buildIncome(0, apply, applyMember.id, apply.bonus, 0, 0)
                yield buildIncome(1, apply, applyMember.id, 0, apply.interest, 0)
                yield buildIncome(2, apply, applyMember.id, 0, 0, apply.money - applyMember.bonus - applyMember.interest)
                applyMember.bonus = 0
                applyMember.interest = 0
                applyMember.money = money_new
            }
            yield applyMember.save()
        }
    })
}

function buildIncome(dtype, apply, memberid, sur_bonus, sur_interest, sur_money) {
    const title = ""
    const money = 0
    const type = ""

    if (dtype === 0) {
        title = "奖金"
        money = sur_bonus
        type = "bonus"
    }
    if (dtype === 1) {
        title = "利息"
        money = sur_interest
        type = "interest"
    }
    if (dtype === 2) {
        title = "本金"
        money = sur_money
        type = "money"
    }

    return models.dmd_income.create({
        the_time: moment().unix(),
        apply_id: apply.id,
        member_id: memberid,
        type: type,
        intro: "成功提现￥" + apply.money + "元，从" + title + "余额中扣除￥" + money + "元"
    })
}

// 完成播种总单
function finishOffer(offer, offerMember, offerApply) {
    return co(function*() {
        const offerSum = yield models.dmd_offer_apply.sum('money', {
            where: {
                oid: offerApply.oid,
                state: 4
            }
        })

        if (offer.money === offerSum) {
            if (offerMember.ok === 0) {
                offerMember.ok = 1
                yield offerMember.save()
            }

            const ice = 0
            if (offer.fst === 1) {
                ice = models.dmd_config.getConfig(23)
            } else {
                const day = Math.ceil((moment().unix() - offer.the_time) / (60 * 60 * 24))

                const from_time = moment().format('MM/DD/YYYY') + " " + moment.unix(offer.the_time).format("hh:mm:ss")
                day = from_time >= moment().format("MM/DD/YYYY hh:mm:ss") ? day : day - 1

                day = day < 1 ? 1 : day
                const conf24 = Number(models.dmd_config.getConfig(24)) //15 投资周期（单位：天)
                ice = conf24 - day
            }
            offer.state = 100
            offer.income = offer.money
            offer.end_time = moment().unix()
            offer.ice = ice
            yield offer.save()

            const text = offer.fst === 0 ? "播种" : "购买激活币";
            yield models.dmd_income.create({
                member_id: offerMember.id,
                type: "money",
                money: offer.money,
                intro: "成功" + text + "￥" + offer.money + "元，本金将在冻结" + ice + "天后自动收入现金余额"
            })

            if (offer.fst === 0) {
                //发放奖励
                yield send_interest(offerMember, offer)
                //发放团队奖励（直推 ＋ 团队奖）
                yield send_team_bonus(offerMember, offer)
            }
        }
    })
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
