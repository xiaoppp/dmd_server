"use strict"
const models = require('../mysql/index')
const co = require('co')
const moment = require('moment')

const dmd_offer_help = {
    // 所有正在准备播种的单子
    prepareMatchOffers(pendingDays) {
        return models.dmd_offer_help
            .findAll({
                where: {
                    match_all: 0, //0表示未全部匹配完 1表示已全部匹配完
                    the_time: { //播种天数大于7天
                        $lt: moment().unix() - 60*60*24*pendingDays
                    },
                    state: {
                        $lt: 100
                    }
                }
            })
    },
    // 会员冻结本金总额
    memberFreezeIncome(memberid) {
        return models.dmd_offer_help.sum(
            'income', {
                where: {
                    member_id: memberid,
                    income: {
                        $gt: 0
                    },
                    state: 100
                }
            })
    },
    //取最后完成的播种总单
    lastestOffer(memberid) {
        return models.dmd_offer_help.findOne({
            where: {
                member_id: memberid,
                state: {
                    $lt: 100
                }
            },
            order: [
                ['the_time', 'DESC']
            ]
        }).catch(error => console.log(error))
    },
    // 播种检查
    checkOffer(money, member, offer) {
        return co(function*() {
            if (!member.weixin || !member.alipay || !member.bank || !member.bank_num) {
                yield Promise.reject("请先完善资料")
            }
            const conf2 = models.dmd_config.getConfig(2) //array(1000,3000,5000,10000,20000,50000);
            const conf2list = conf2.split(',')

            const conf22 = models.dmd_config.getConfig(22)
            const conf22list = conf22.split('-')
            if (conf22list[0] !== "1") {
                yield Promise.reject("系统临时限制播种")
            }

            const conf7 = models.dmd_config.findById(7) //播种每天最高限额（单位：元）

            const alreadyOfferMoney = yield models.dmd_apply_help.sum('money', {
                where: {
                    the_time: {
                        $lte: moment().endOf('day').unix()
                    },
                    the_time: {
                        $gte: moment().startOf('day').unix()
                    }
                }
            })
            console.log("alreadyOfferMoney", alreadyOfferMoney)
            if (alreadyOfferMoney + money > Number(conf7)) {
                yield Promise.reject("不能超过平台每日最高限额")
            }

            if (offer && offer.state < 100) {
                yield Promise.reject("上一次的播种还未完成")
            }

            if (!offer || offer.the_time < member.reg_time) { //新注册用户
                const conf26 = models.dmd_config.getConfig(26) //买激活币开关
                if (conf26 != 1) {
                    yield Promise.reject("临时限制购买激活币")
                }
                if(money !== Number(conf2list[0])) {
                    yield Promise.reject("新注册或刚解冻会员必须购买激活币")
                }
            }

            if (money < offer.money) {
                yield Promise.reject("本次下单金额不能低于上一次下单金额")
            }

            if (member.rank >= 5 && money < Number(conf2list[3])) {
                yield Promise.reject("经理人级别下单不能低于" + conf2list[3] + "元")
            }
        })
    }
}

Object.assign(models.dmd_offer_help, dmd_offer_help)
