"use strict"

const co = require('co')
const moment = require('moment')
const models = require('../mysql/index')

module.exports = () => {
    co(function*() {
        const conf16 = models.dmd_config.getConfig(16)
        const conf17 = models.dmd_config.getConfig(17)
        const conf18 = models.dmd_config.getConfig(18)
        const conf19 = models.dmd_config.getConfig(19)
        const conf20 = models.dmd_config.getConfig(20)

        const conf16List = conf16.split('-')
        const conf17List = conf16.split('-')
        const conf18List = conf16.split('-')
        const conf19List = conf16.split('-')
        const conf20List = conf16.split('-')

        const members = yield models.dmd_members.findAll({where: {
                rank: {
                    $lt: 5
                },
                $and: [
                        {
                            team_ids: {
                                $ne: '0'
                            }
                        },
                        {
                            team_ids: {
                                $ne: null
                            }
                        }
                    ]
            }})

        //console.log(members.length, '=============================')

        for (let i = 0; i < members.length; i++) {
            let member = members[i]
            member.team_ids = member.team_ids.replace(/^\,/, '')
            member.team_ids = member.team_ids.replace(/\,$/, '')
            const allc = member.team_ids.split(',').length
            const cct = yield models.dmd_members.count({where: {
                parent_id: member.id,
                ok: 1
            }})

            if (cct >= conf20List[0] && allc >= conf20List[1] && member.rank <= 4) {
                member.rank = 5
            }
            else if(cct >= conf19List[0] && allc >= conf19List[1] && member.rank <= 3) {
                member.rank = 4
            }
            else if(cct >= conf18List[0] && allc >= conf18List[1] && member.rank <= 2) {
                member.rank = 3
            }
            else if(cct >= conf17List[0] && allc >= conf17List[1] && member.rank <= 1) {
                member.rank = 2
            }
            else if(cct >= conf16List[0] && allc >= conf16List[1] && member.rank <= 0) {
                member.rank = 1
            }
            yield member.save()
        }
        return yield models.dmd_last_time.update(38)
    })
    .then(d => console.log(d))
    .catch(error => console.log(error))
}
