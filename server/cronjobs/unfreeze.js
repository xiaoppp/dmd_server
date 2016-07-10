"use strict"

const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')

module.exports.unfreezeMoney = () => {
    co(function*(){
        const conf33 = models.dmd_config.getConfig(33) //最后一次执行解冻本金时间

        const sql = "select id, member_id, income, ice, end_time from dmd_offer_help " +
                "where income > 0 and end_time + ice*60*60*24 < " + moment().unix() + " and state = 100"

        const offers = yield models.sequelize.query(sql, { type: models.sequelize.QueryTypes.SELECT})

        for (let i = 0; i < offers.length; i++) {
            let offer = offers[i]

            if (offer.end_time < moment().unix() - 60*60*24*offer.ice) {
                const member = yield models.dmd_members.findById(offer.member_id)
                member.money = member.money + offer.income
                yield member.save()

                const updatesql = "update dmd_offer_help set income = 0 where id = " + offer.id
                yield models.sequelize.query(updatesql, { type: models.sequelize.QueryTypes.UPDATE})
            }
        }

        yield models.dmd_last_time.update(33)
    })
    .then(d => console.log(d))
    .catch(error => console.log(error))
}

module.exports.unfreezeBonus = () => {
    co(function*(){
        const conf34 = models.dmd_config.getConfig(34) //最后一次执行解冻奖金时间

        const sql = "select id, member_id, money, ice, the_time from dmd_income " +
                "where ice > 0 and the_time + ice*60*60*24 < " + moment().unix() + " and type = 'bonus'"

        const incomes = yield models.sequelize.query(sql, { type: models.sequelize.QueryTypes.SELECT})

        for (let i = 0; i < incomes.length; i++) {
            let income = incomes[i]

            if (income.the_time < moment().unix() - 60*60*24*income.ice) {
                const member = yield models.dmd_members.findById(income.member_id)

                member.bonus = Number(member.bonus) + Number(income.money)
                yield member.save()

                const updatesql = "update dmd_income set ice = 0 where id = " + income.id
                yield models.sequelize.query(updatesql, { type: models.sequelize.QueryTypes.UPDATE})
            }
        }

        yield models.dmd_last_time.update(34)
    })
    .then(d => console.log(d))
    .catch(error => console.log(error))
}
