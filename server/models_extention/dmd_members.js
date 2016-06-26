"use strict"
const models = require('../mysql/index')
const co = require('co')
const moment = require('moment')

const dmd_members = {
    //冻结会员
    freezeMember(memberid, intro) {
        return co(function*() {
            const member = yield models.dmd_members.findById(memberid)
            member.state = 0
            member.save()

            const offerPairs = yield models.dmd_offer_apply.findAll({
                where : {
                    om_id: memberid,
                    state: 2
                }
            })

            for (let i = 0; i < offerPairs.length; i++) {
                let pair = offerPairs[i]

                const apply = yield models.dmd_apply_help.findById(pair.aid)
                apply.match_all = 0
                apply.deny_count = apply.deny_count + 1
                yield apply.save()

                const offer = yield models.dmd_offer_help.findById(pair.oid)
                yield models.dmd_unmatch_log.create({
                    order_money: offer.money,
                    order_the_time: offer.the_time,
                    unmatch_time: moment().unix(),
                    pay_time: pair.pay_time || 0,
                    end_time: pair.end_time || 0,
                    intro: intro
                })
                const count = yield models.dmd_offer_apply.count({where: {
                    oid: pair.oid,
                    state: {
                        $gt: 0
                    }
                }})
                if (count == 0) {
                    yield models.sequelize.query("delete from dmd_offer_help where id =" + pair.oid,
                        { type: models.sequelize.QueryTypes.DELETE})
                }
            }
            yield models.sequelize.query("delete from dmd_offer_apply where state = 2 and om_id =" + memberid,
                { type: models.sequelize.QueryTypes.DELETE})

            const applyPairs = yield models.dmd_offer_apply.findAll({
                where : {
                    om_id: memberid,
                    state: 2
                }
            })

            for (let i = 0; i < applyPairs.length; i++) {
                let pair = applyPairs[i]
                yield models.sequelize.query("update dmd_offer_help set match_all = 0 where id =" + pair.oid,
                    { type: models.sequelize.QueryTypes.UPDATE})
                const apply = yield models.dmd_apply_help.findById(pair.aid)
                yield models.dmd_unmatch_log.create({
                    order_money: apply.money,
                    order_the_time: apply.the_time,
                    unmatch_time: moment().unix(),
                    pay_time: pair.pay_time || 0,
                    end_time: pair.end_time || 0,
                    intro: intro
                })
                const count = yield models.dmd_offer_apply.count({where: {
                    aid: pair.aid,
                    state: {
                        $gt: 0
                    }
                }})
                if (count == 0) {
                    yield models.sequelize.query("delete from dmd_apply_help where id =" + pair.aid,
                        { type: models.sequelize.QueryTypes.DELETE})
                }
            }

            yield models.sequelize.query("delete from dmd_offer_apply where state = 2 and am_id =" + memberid,
                { type: models.sequelize.QueryTypes.DELETE})

            yield models.sequelize.query("delete from dmd_offer_help where state = 1 and member_id =" + memberid,
                { type: models.sequelize.QueryTypes.DELETE})

            yield models.sequelize.query("delete from dmd_apply_help where state = 1 and member_id =" + memberid,
                { type: models.sequelize.QueryTypes.DELETE})
        })
    },
    findChildrenAmount(memberid) {
        return co(function*() {
            console.log(123, '=================')
            const member = yield models.dmd_members.findById(memberid)
            if (member.team_ids) {
                const ids = member.team_ids
                const idslist = ids.split(',')
                return idslist.length
            }
        })
    },
    //是否首次注册会员
    isNewMember(memberid) {
        return co(function*() {
            const member = yield models.dmd_members.findById(memberid)
            const offer = yield models.dmd_offer_help.findOne({
                where: {
                    member_id: memberid
                },
                order: [
                    ['the_time', 'DESC']
                ]
            })

            if (!offer || offer.the_time < member.reg_time) {
                return true
            }
            else
                return false
        })
    },
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
