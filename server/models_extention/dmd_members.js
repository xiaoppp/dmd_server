"use strict"
const models = require('../mysql/index')
const co = require('co')
const moment = require('moment')

const dmd_members = {
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
