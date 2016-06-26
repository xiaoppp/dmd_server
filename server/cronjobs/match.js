"use strict"

const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')

module.exports = () => {
    co(function*() {
        const pair = yield findOffer()

        yield updateOffer(pair)

        yield models.dmd_last_time.update(37)
    })
    .then(d => console.log(d))
    .catch(error => console.log(error))
}

// 查找适合的播种单子
function findOffer() {
    return co(function*() {
        const conf5 = models.dmd_config.getConfig(5) //匹配等待天数

        const applys = yield models.dmd_apply_help.prepareMatchApplys()

        for (let i = 0; i < applys.length; i++) {
            let apply = applys[i]

            const applyMember = yield models.dmd_members.findById(apply.member_id)

            if (applyMember.state === 1) {
                // 当前会员的已经匹配金额
                const totalApplyMoney = yield models.dmd_offer_apply.totalApplyMoney(apply.id)
                // 要求的收获金额和已经匹配金额的差值
                const applyGapMoney = apply.money - totalApplyMoney
                // console.log('==============>', totalApplyMoney)

                if (applyGapMoney <= 0) { //已经收获完，更新收获状态
                    apply.match_all = 1
                    yield apply.save()
                }
                if (applyGapMoney > 0) { //还没收获完,给这个人匹配
                    //查所有未完成播种
                    const offers = yield models.dmd_offer_help.prepareMatchOffers(conf5)

                    for (let j = 0; j < offers.length; j++) {
                        let offer = offers[j]
                        //播种人
                        const offerMember = yield models.dmd_members.findById(offer.member_id)
                        if (offerMember.state === 1) {
                            // 已经播种总金额
                            const totalOfferMoney = yield models.dmd_offer_apply.totalOfferMoney(offer.id)
                            // console.log('==============>', totalOfferMoney)
                            // 如果播种金额超过 已经播种总金额
                            if (offer.money > totalOfferMoney) {
                                // 最终匹配的总单
                                // 收获差额
                                // 播种差额
                                return {
                                    offer: offer,
                                    apply: apply,
                                    offerGapMoney: offer.money - totalOfferMoney,
                                    applyGapMoney: applyGapMoney
                                }
                            }
                            else {
                                // 如果发现该总单已完成，将总单标志乘完成状态，继续查找其它播种单子
                                offer.match_all = 1
                                yield offer.save()
                            }
                        }
                    }
                }
            }
        }
    })
}

// 增加匹配 更新总单和匹配状态
function updateOffer(pair) {
    const offer = pair.offer
    const apply = pair.apply
    const applyGapMoney = pair.applyGapMoney
    const offerGapMoney = pair.offerGapMoney
    const money = applyGapMoney > offerGapMoney ? offerGapMoney : applyGapMoney

    return co(function*() {
        const time = moment().unix()
        const offerapply = yield models.dmd_offer_apply.create({
            the_time: time,
            code: "OA" + offer.member_id + apply.member_id + time,
            oid: offer.id,
            aid: apply.id,
            om_id: offer.member_id,
            am_id: apply.member_id,
            money: money
        })
        offer.state = 2
        yield offer.save()
        apply.state = 2
        yield apply.save()
    })
}
