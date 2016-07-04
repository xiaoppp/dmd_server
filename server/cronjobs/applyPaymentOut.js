"use strict"

const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')

module.exports = () => {
    co(function*() {
        const conf13 = models.dmd_config.getConfig(13) //账号解封需要的金额
        const conf14 = models.dmd_config.getConfig(14)
        const conf36 = yield models.dmd_last_time.findById(36) //最后一次执行超时收款时间

        //$oas2 = $db->select("offer_apply", "*", "state=3 and judge != 1");
        const oas = yield models.dmd_offer_apply.findAll({where: {
            state : 3,
            judge : {
                $ne: 1
            }
        }})

        for (let i = 0; i< oas.length; i++) {
            const member = yield models.dmd_members.findById(oa.om_id)

            //内部会员不做超时首款处理
            if (member.type === 0 && oa.pay_time < moment().unix() - 60*60*Number(conf13)) {
                yield models.dmd_offer_apply.payIn(oa)
            }
        }

        return yield models.dmd_last_time.update(36)
    })
        .then(d => console.log(d))
        .catch(error => console.log(error))
}
