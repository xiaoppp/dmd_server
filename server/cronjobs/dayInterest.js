"use strict"

const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')

module.exports = () => {
    co(function*() {
        const members = yield findAllMembers()

        for (let i = 0; i < members.length; i++) {
            yield calculateIntrest(members[i])
        }

        return yield models.dmd_last_time.update(30)
    })
    .then(d => console.log(d))
    .catch(error => console.log(error))
}

function calculateIntrest(member) {
    const conf2 = models.dmd_config.getConfig(2) //播种可选金额（单位：元）1000-3000-5000-10000-30000-50000
    const conf2List = conf2.split('-')

    const conf6 = models.dmd_config.getConfig(6) //日利息
    const conf10 = models.dmd_config.getConfig(10) //利息计算最多天数，超出则不再计利息
    const conf30 = models.dmd_config.getConfig(30) //最后一次计日利息的时间

    return co(function*() {
        const lastOffer = yield models.dmd_offer_help.findOne({ //有没有完成播种的非首单
            where: {
                member_id: member.id,
                state: 100,
                fst: 0 //1表示首次排单
            },
            order: [
                ['id', 'DESC']
            ]
        })

        console.log(lastOffer, "======================>lastOffer")

        if (lastOffer && lastOffer.last_time > moment().unix() - 60*60*24*conf10) {
            //所有播种非首单的总金额
            let freezeMoney = yield models.dmd_offer_help.sum('income', {
                where: {
                    member_id: member.id,
                    state: 100,
                    fst: 0,
                    income: {
                        $gt: 0
                    }
                }
            })
            // 所有首次激活排单的总金额
            let regMoney = yield models.dmd_offer_help.sum('income', {
                where: {
                    member_id: member.id,
                    state: 100,
                    fst: 1,
                    income: {
                        $gt: 0
                    }
                }
            })

            freezeMoney = Number(freezeMoney)
            regMoney = Number(regMoney)
            //激活总金额为0 则返回当前用户的money－1000 否则返回用户的money
            const moneyt = regMoney === 0 ? member.money - conf2List[0] : member.money
            const money = moneyt > 0 ? moneyt : 0
            //  money + 所有排单非首单的总金额
            const interest = (money + freezeMoney) * conf6 //日结钱数
            if (interest > 0) {
                const time = moment().unix()
                member.interest = Number(member.interest) + interest
                member.last_interest_time = time
                yield member.save()

                yield models.dmd_income.create({
                    member_id: member.id,
                    type: "interest",
                    money: interest,
                    the_time: time,
                    intro: moment().format('YYYY-MM-DD') + "，获得利息￥" + interest + "元。"
                })
            }
        }
    })
}

function findAllMembers() {
    return models.dmd_members.findAll({
        where: {
            type: 0,
            ok: 1,
            state: 1,
            last_interest_time: {
                $lt: moment().startOf('day').unix()
            }
        }
    })
}
