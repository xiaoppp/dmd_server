"use strict"
const models = require('../mysql/index')
const co = require('co')
const moment = require('moment')
const util = require('../util/util')

const dmd_offer_apply = {
    //会员当前已收获的金额
    totalApplyMoney(applyid) {
        return co(function*() {
            const money = yield models.dmd_offer_apply.sum('money',
                {
                    where: {
                        aid: applyid
                    }
                })
            if (money)
                return money
            else
                return 0
        })
    },
    //会员当前已播种的金额
    totalOfferMoney(offerid) {
        return co(function*() {
            const money = yield models.dmd_offer_apply.sum('money',
                {
                    where: {
                        oid: offerid
                    }
                })
            if (money)
                return money
            else
                return 0
        })
    },
    //确认收款
    payIn(offerApply) {
        return co(function*() {

            offerApply.state = 4
            offerApply.ent_time = moment().unix()
            offerApply.save()

            const om = yield models.dmd_members.findById(offerApply.om_id)
            const am = yield models.dmd_members.findById(offerApply.am_id)

            console.log('==================om', om)
            console.log('==================am', am)

            //完成收获
            let apply = yield models.dmd_apply_help.findById(offerApply.aid)
            yield finishApply(apply, am, offerApply)

            //完成播种
            let offer = yield models.dmd_offer_help.findById(offerApply.oid)
            yield finishOffer(offer, om, offerApply)

            if (offer.fst === 0) {
                //发放阶梯奖
                yield send_step_award(offer, offerApply)
            }
        })
    }
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
    let title = ""
    let money = 0
    let type = ""

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

            let ice = 0
            if (offer.fst === 1) {
                ice = models.dmd_config.getConfig(23)
            } else {
                let day = Math.ceil((moment().unix() - offer.the_time) / (60 * 60 * 24))

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

            let text = offer.fst === 0 ? "播种" : "购买激活币";
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

function send_interest(member, offer) {
    return co(function*() {
        const conf6 = models.dmd_config.getConfig(6) //0.05 日利息
        const conf10 = models.dmd_config.getConfig(10) //30 利息计算最多天数，超出则不再计利息
        const conf27 = models.dmd_config.getConfig(27) //老会员下单间隔天数，超出不下单则不再获得奖金
        const conf28 = models.dmd_config.getConfig(28) //冻结二代以上奖金天数

        let day = Math.ceil((moment().unix() - offer.the_time) / (60 * 60 * 24))

        let from_time = moment().format('MM/DD/YYYY') + " " + moment.unix(offer.the_time).format("hh:mm:ss")
        day = from_time >= moment().format("MM/DD/YYYY hh:mm:ss") ? day : day - 1

        day = day < 1 ? 1 : day
        day = day >= conf10 ? conf10 : day

        let interest = offer.money * Number(conf6) * day

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
                    let istr = ""
                    if (i == 0) {
                        parent.bonus = parent.bonus + bonus
                        yield parent.save()
                    }
                    else {
                        istr = "奖金冻结" + conf28 + "天后自动计入奖金余额。"
                    }
                    yield models.dmd_income.create({
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

function send_step_award(offer, oa) {
    return co(function*() {
        let day = Math.ceil((moment().unix() - offer.the_time) / (60 * 60 * 24))
        let from_time = moment().format('MM/DD/YYYY') + " " + moment.unix(offer.the_time).format("hh:mm:ss")
        day = from_time >= moment().format("MM/DD/YYYY hh:mm:ss") ? day : day - 1

        day = day < 1 ? 1 : day
        const conf24 = models.dmd_config.getConfig(24)

        let ice = conf24 - day //15 投资周期（单位：天）
        if (offer.fst === 0) { //非首单才发团队奖
            const conf31 = models.dmd_config.getConfig(31) //播种方在2小时 - 5小时内打款的奖励比例
            const conf31List = conf31.split('-') //0.02-0.01
            let bonus_add = 0
            const hour = (oa.pay_time - oa.the_time)/(60*60)
            if (hour < 2) {
                bonus_add = oa.money * conf31[0]
            } else if(hour < 5) {
                bonus_add = oa.money * conf31[1]
            }
            if (bonus_add > 0) {
                yield models.dmd_income.create({
                    member_id: oa.om_id,
                    type: "bonus",
                    money: bonus_add,
                    intro: "您成功播种￥" + offer.money + "元，在" + (hour+1) + "小时内完成" + oa.money + "的打款，奖励您￥" + bonus_add + "元。奖金冻结" + ice + "天后自动计入奖金余额。",
                    offer_id: offer.id,
                    ice: ice,
                    the_time: moment().unix()
                })
            }
        }
    })
}

Object.assign(models.dmd_offer_apply, dmd_offer_apply)
