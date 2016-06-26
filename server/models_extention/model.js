"use strict"
const co = require('co')
const moment = require('moment')
const configCache = require('../util/configCache')

module.exports = function(models) {

    require('./dmd_members')
    require('./dmd_apply_help')
    require('./dmd_offer_help')
    require('./dmd_offer_apply')
    require('./dmd_income')

    const dmd_last_time = {
        update(id) {
            return co(function*() {
                const time = yield models.dmd_last_time.findById(id)
                time.val = moment().unix()
                yield time.save()
            })
        }
    }

    const dmd_config = {
        getConfigAll() {
            return configCache.cache()
        },
        getConfig(id) {
            id = id - 1
            return configCache.getConfig(id)
        }
        // setConfig(id, val) {
        //     return co(function*() {
        //         let config = yield models.dmd_config.findById(id)
        //         config.val = val
        //         config.save()
        //     })
        // }
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

    Object.assign(models.dmd_config, dmd_config)
    Object.assign(models.dmd_news, dmd_news)
    Object.assign(models.dmd_news_log, dmd_news_log)
    Object.assign(models.dmd_last_time, dmd_last_time)

    // add associations
    models.dmd_members.hasMany(models.dmd_offer_help, {as: 'offers', foreignKey: 'member_id', constraints: false})
    models.dmd_members.hasMany(models.dmd_apply_help, {as: 'applys', foreignKey: 'member_id', constraints: false})

    models.dmd_offer_help.hasMany(models.dmd_offer_apply, {as: 'pairs', foreignKey: 'oid', constraints: false})
    models.dmd_apply_help.hasMany(models.dmd_offer_apply, {as: 'pairs', foreignKey: 'aid', constraints: false})

    // models.dmd_offer_help.findById(147).then(offer => {
    //     console.log(offer.id)
    //     offer.getPairs().then(p => {
    //         console.log(p)
    //     })
    // })

}
