"use strict"

const co = require('co')
const moment = require('moment')

const models = require('../mysql/cron')
require('./mysql/model_extention')(models)

require('./util/configCache')

const match = require('./cronjobs/match')
const dayInterest = require('./cronjobs/dayInterest')

const CronJob = require('cron').CronJob;


//每5分钟自动匹配
const matchJob = new CronJob({
    cronTime: '* * 5 * * *',
    onTick: function() {
        match()
    },
    start: false,
    timeZone: 'Asia/Shanghai'
})

//每日12点计算日结
const dayInterest = new CronJob({
    cronTime: '00 00 03 * * *',
    onTick: function() {
        dayInterest()
    },
    start: false,
    timeZone: 'Asia/Shanghai'
})

// const unFreezeMoneyJob = new CronJob({
//     cronTime: '* * 5 * * *',
//     onTick: function() {
//         match()
//     },
//     start: false,
//     timeZone: 'America/Los_Angeles'
// })
//
// const unFreezeBounsJob = new CronJob({
//     cronTime: '* * 5 * * *',
//     onTick: function() {
//         match()
//     },
//     start: false,
//     timeZone: 'America/Los_Angeles'
// })
//
// const regJob = new CronJob({
//     cronTime: '* * 5 * * *',
//     onTick: function() {
//         match()
//     },
//     start: false,
//     timeZone: 'America/Los_Angeles'
// })
