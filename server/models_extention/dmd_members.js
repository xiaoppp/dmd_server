"use strict"
const models = require('../mysql/index')
const co = require('co')
const moment = require('moment')

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
