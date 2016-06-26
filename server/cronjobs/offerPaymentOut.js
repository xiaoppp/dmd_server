"use strict"

const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')

module.exports = () => {
    co(function*(){
        const conf14 = models.dmd_config.getConfig(14) //账号解封需要的金额
        const conf12 = models.dmd_config.getConfig(12) //打款超时时间
        const conf35 = models.dmd_config.getConfig(35) //最后一次执行超时打款时间

        const limit_time = moment("2016-06-11 09:00:00").unix()

        const pairs = yield models.dmd_offer_apply.findAll({
            where: {
                state: 2
            }
        })

        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i]
            const member = models.dmd_members.findById(pair.om_id)

            // 超过时间 冻结会员
            if (member.type === 0 && pair.the_time < moment().unix()-60*60*conf12) {
                models.dmd_members.freezeMember(member.id, "超时打款")
            }
        }

        yield models.dmd_last_time.update(35)
    })
    .then(d => console.log(d))
    .catch(error => console.log(error))
}
