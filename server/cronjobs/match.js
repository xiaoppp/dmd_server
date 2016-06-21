"use strict"

const co = require('co')
const _ = require('underscore')
const models = require('../mysql/cron')
require('../mysql/model_extention')(models)

co(function*() {
    const config5 = yield models.dmd_config.getConfig(5) //匹配等待天数
    const applys = yield models.dmd_apply_help.prepareMatchApplys(config5.val)

    for (let i = 0; i < applys.length; i++) {
        const member = yield models.dmd_members.findById(apply.member_id)

        if (member.state === 1) {
            // 当前会员的总匹配金额
            const totalMoney = yield models.dmd_offer_apply.totalMoney(member.id)
            const gapMoney = apply.money - totalMoney

            // console.log('==============>', totalMoney)
            // console.log('==============>', gapMoney)
            if (gapMoney > 0) {
                const offers = yield models.dmd_offer_help.prepareMatchOffers(config5.val)
                
                for (let j = 0; j < offers.length; j++) {
                }
            }
        }
    }
})
.then()
.catch(error => console.log(error))
