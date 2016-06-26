"use strict"

const co = require('co')
const moment = require('moment')
const models = require('./mysql/index')
require('./models_extention/model')(models)
require('./util/configCache')

const match = require('./cronjobs/match')
const dayInterest = require('./cronjobs/dayInterest')
const unfreeze = require('./cronjobs/unfreeze')

const CronJob = require('cron').CronJob;

// */2 * * * * * runs every 2 second
// */3 * * * * * runs every 3 second
// 0 */3 * * * * runs every 3 minutes
// 0 */5 * * * * runs every 5 minutes

// const testJob = new CronJob({
//     cronTime: '*/1 * * * * *',
//     onTick: function() {
//         console.log('===============================1')
//         console.log('test job')
//     },
//     onComplete: function() {
//         console.log('===============================2')
//         console.log('complete job')
//     },
//     start: true,
//     timeZone: 'Asia/Shanghai'
// })

//每5分钟自动匹配
const matchJob = new CronJob({
    cronTime: '0 */5 * * * *',
    onTick: function() {
        console.log('===============================1')
        console.log('run auto match')
        match()
    },
    start: true,
    timeZone: 'Asia/Shanghai'
})

//每日24点计算日结
const dayInterestJob = new CronJob({
    cronTime: '0 3 */24 * * *',
    onTick: function() {
        console.log('===============================1')
        console.log('run day interest')
        dayInterest()
    },
    start: true,
    timeZone: 'Asia/Shanghai'
})

// 解冻本金
const unFreezeMoneyJob = new CronJob({
    cronTime: '0 */10 * * * *',
    onTick: function() {
        console.log('===========unFreezeMoneyJob')
        unfreeze.unfreezeMoney()
    },
    start: true,
    timeZone: 'Asia/Shanghai'
})

//解冻奖金
const unFreezeBounsJob = new CronJob({
    cronTime: '59 */10 * * * *',
    onTick: function() {
        console.log('===========unFreezeBonusJob')
        unfreeze.unfreezeBonus()
    },
    start: true,
    timeZone: 'Asia/Shanghai'
})

// const regJob = new CronJob({
//     cronTime: '* * 5 * * *',
//     onTick: function() {
//         match()
//     },
//     start: false,
//     timeZone: 'America/Los_Angeles'
// })
