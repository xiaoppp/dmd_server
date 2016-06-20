"use strict"
const co = require('co')
const models = require('../mysql/index')

const dmd_income = {
    // 会员奖金总额
    memberTotalBonus(memberid) {
        //$D['bonus_ice'] = $db->group("income", "sum(money)", "member_id=".$member['id']." and ice>0 and type='bonus'");
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

const dmd_offer_apply = {
    //$D['offer']['pct'] = $db->group("offer_apply", "count(id)", "oid=".$D['offer']['id']);
}

const dmd_apply_help = {
    // 取最后的收获总单
    lastestApply(memberid) {
        return models.dmd_apply_help.findOne({
            where: {
                member_id: memberid,
                state: {
                    $lt: 100
                }
            },
            order: [
                ['the_time', 'DESC']
            ],
            include: [{
                model: models.dmd_offer_apply
            }]
        }).catch(error => console.log(error))
    }
}

const dmd_offer_help = {
    // 会员本金总额
    memberTotalIncome(memberid) {
        //$D['money_ice'] = $db->group("offer_help", "sum(income)", "member_id=".$member['id']." and income>0 and state=100");
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
    //取最后的播种总单
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
            ],
            include: [{
                model: models.dmd_offer_apply
            }]
        }).catch(error => console.log(error))
    }
}

const dmd_news = {
    //查看最新一条公告信息
    latestNews() {
        return models.dmd_news.findOne({
            order: [
                ['the_time', 'DESC']
            ]
        })
    }
}

const dmd_news_log = {
    //查看某会员是否有最新的新闻公告
    hasLatestNews(memberid, newsid) {
        return co(function*() {
            const count = yield models.dmd_news_log
                .count({
                    where: {
                        member_id: memberid,
                        news_id: newsid
                    }
                })

            if (count === 0)
                return false
            else
                return true
        });
    }
}

const dmd_members = {
    updateAllParents(parents, memberid) {
        return co(function*() {
            // console.log('==================', memberid)
            // console.log(parents.length)

            yield parents.map(function*(p) {
                // console.log("==========================>", p.level)
                if (p.team_ids)
                    p.team_ids = p.team_ids + memberid + ","
                else
                    p.team_ids = "," + memberid + ","

                yield p.save()
            })
        })
    },
    //查找所有上级会员
    findAllParents(memberid) {
        let parents = []

        return co(function*() {
            while (true) {
                const member = yield models.dmd_members.findById(memberid)
                    // console.log('==================>')
                    // console.log(member.parent_id)
                parents.push(member)

                if (member.parent_id !== 0)
                    memberid = member.parent_id
                else break;
            }
            // when co finished, it will return parents
            return parents
        })
    }
}

Object.assign(models.dmd_members, dmd_members)
Object.assign(models.dmd_income, dmd_income)
Object.assign(models.dmd_offer_apply, dmd_offer_apply)
Object.assign(models.dmd_apply_help, dmd_apply_help)
Object.assign(models.dmd_offer_help, dmd_offer_help)
Object.assign(models.dmd_news, dmd_news)
Object.assign(models.dmd_news_log, dmd_news_log)

// add associations
models.dmd_offer_help.hasMany(models.dmd_offer_apply, {as: 'pairs', foreignKey: 'oid'})
models.dmd_apply_help.hasMany(models.dmd_offer_apply, {as: 'pairs', foreignKey: 'aid'})

// models.dmd_offer_help.findById(147).then(offer => {
//     console.log(offer.id)
//     offer.getPairs().then(p => {
//         console.log(p)
//     })
// })
