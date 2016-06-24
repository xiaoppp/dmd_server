"use strict"
const models = require('../mysql/index')
const co = require('co')
const moment = require('moment')

const dmd_income = {
    // 会员冻结奖金总额
    memberFreezeBonus(memberid) {
        return models.dmd_income.sum(
            'money', {
                where: {
                    member_id: memberid,
                    ice: {
                        $gt: 0
                    },
                    type: 'bonus'
                }
            })
    }
}

Object.assign(models.dmd_income, dmd_income)
