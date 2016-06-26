"use strict"
const models = require('../mysql/index')
const co = require('co')
const moment = require('moment')

const dmd_apply_help = {
    test() {
        console.log('test')
    },
    //所有正在准备收获的单子
    prepareMatchApplys() {
        return models.dmd_apply_help
            .findAll({
                where: {
                    match_all: 0,
                    deny_count: {
                        $lt: 2
                    },
                    state: {
                        $lt: 100
                    }
                },
                order: [
                    ['id', 'asc']
                ]
            })
    },
    //正在收获的总额
    applyTotalMoney(memberid) {
        return models.dmd_apply_help
            .sum('money', {
                where: {
                    member_id: memberid,
                    state: {
                        $lt: 100
                    }
                }
            })
    },
    // 取最后的收获总单
    lastestApply(memberid) {
        return models.dmd_apply_help
            .findOne({
                where: {
                    member_id: memberid,
                    state: {
                        $lt: 100
                    }
                },
                order: [
                    ['the_time', 'DESC']
                ]
            })
    },
    //检查是否可以播种
    checkApply(money, member) {
        return co(function*() {
            const conf22 = models.dmd_config.getConfig(22) //系统是否允许收获
            const conf22list = conf22.split('-')

            if (conf22list[1] != 1) {
                yield Promise.reject("系统临时限制收获")
            }

            const conf32 = models.dmd_config.getConfig(32)
            const conf32list = conf32.split('-')

            const currentHour = new Date().getHours() //收获时间
            if ((currentHour >= Number(conf32list[0]) && currentHour < 24) || currentHour < Number(conf32list[1])) {
                yield Promise.reject(conf32list[0] + "时至" + conf32list[1] + "时限制收获")
            }

            const conf3 = models.dmd_config.getConfig(3) //申请帮助最小金额 - 被整除数
            const conf3list = conf3.split('-')

            if (money < Number(conf3list[0])) {
                yield Promise.reject('收获金额不能小于' + conf3list[0])
            }
            console.log(money)
            console.log(Number(conf3list[1]))
            console.log(money % Number(conf3list[1]))
            if(money % Number(conf3list[1]) !== 0) {
                yield Promise.reject("收获金额必须要是" + conf3list[1] + "的整倍数")
            }

            console.log("===============")

            const applyTotalMoney = yield models.dmd_apply_help.applyTotalMoney(member.id)
            if (money > member.money + member.bouns + member.interest - applyTotalMoney) {
                yield Promise.reject('已收获总金额不能大于未提现总金额')
            }

            const conf8 = models.dmd_config.getConfig(8) //收获每天最高限额（单位：元）

            const alreadyApplyMoney = yield models.dmd_apply_help.sum('money', {
                where: {
                    the_time: {
                        $lte: moment().endOf('day').unix()
                    },
                    the_time: {
                        $gte: moment().startOf('day').unix()
                    }
                }
            })

            if (alreadyApplyMoney > money + Number(conf8)) {
                yield Promise.reject('不能超过平台每日最高限额')
            }
        })
    }
}
Object.assign(models.dmd_apply_help, dmd_apply_help)
