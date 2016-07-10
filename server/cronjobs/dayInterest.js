"use strict"

const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')
const log = require('../util/log')

module.exports = () => {
    co(function*() {
        const members = yield findAllMembers()

        for (let i = 0; i < members.length; i++) {

            yield calculateIntrest(members[i])
        }

        yield models.dmd_last_time.update(30)
        return 'successfully'
    })
    .then(d => console.log(d))
    .catch(error => console.log(error))
}

function calculateIntrest(member) {

    const conf6 = models.dmd_config.getConfig(6) //日利息
    const conf10 = models.dmd_config.getConfig(10) //利息计算最多天数，超出则不再计利息
    const conf30 = models.dmd_config.getConfig(30) //最后一次计日利息的时间

    return co(function*() {
        const offers = yield models.dmd_offer_help.findAll({ //有没有完成播种的非首单
            where: {
                member_id: member.id,
                state: 100,
                income: {
                    $gt: 0
                },
                fst: 0 //1表示首次排单
            }
        })

        let interest_sum = 0
        for (let i = 0; i < offers.length; i++) {
            let offer = offers[i]
            if (offer.the_time > moment().unix() - 60*60*24*conf10) {
                const interest = Number(offer.income) * conf6
                interest_sum = interest_sum + interest
            }
        }
        if (interest_sum > 0) {
            const time = moment().unix()
            log.info("新新新的一个更新会员==========================================================>")
            log.info("MMMMMMMMMMMMMMMMMMMM====>会员ID：" + member.id + "====>会员姓名" + member.username)
            log.info("interest===========================>" + member.interest)
            member.interest = Number(member.interest) + interest_sum
            member.last_interest_time = time
            yield member.save()

            const intro = moment().format('YYYY-MM-DD') + "，获得利息￥" + interest_sum + "元。"

            log.info("interest_sum=============================>" + interest_sum)
            log.info("income的信息============>" + intro)

            yield models.dmd_income.create({
                member_id: member.id,
                type: "interest",
                money: interest_sum,
                the_time: 0,
                intro: intro
            })
        }
    })
}

function findAllMembers() {
    return models.dmd_members.findAll({
        where: {
            type: 0,
            ok: 1,
            state: 1
            // last_interest_time: {
            //     $lt: moment().startOf('day').unix()
            // }
        }
    })
}
