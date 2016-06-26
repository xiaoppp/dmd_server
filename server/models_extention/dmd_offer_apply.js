"use strict"
const models = require('../mysql/index')
const co = require('co')
const moment = require('moment')
const util = require('../util/util')

const dmd_offer_apply = {

    //确认收款

    //会员当前已收获的金额
    totalApplyMoney(applyid) {
        return models.dmd_offer_apply.sum(
            'money', {
                where: {
                    aid: applyid
                }
            })
    },
    //会员当前已播种的金额
    totalOfferMoney(offerid) {
        return models.dmd_offer_apply.sum(
            'money', {
                where: {
                    oid: offerid
                }
            })
    }
}

Object.assign(models.dmd_offer_apply, dmd_offer_apply)
