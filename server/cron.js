"use strict"

const co = require('co')
const moment = require('moment')
const models = require('./mysql/index')
require('./models_extention/model')(models)
require('./util/configCache')

const match = require('./cronjobs/match')
const dayInterest = require('./cronjobs/dayInterest')
const unfreeze = require('./cronjobs/unfreeze')
const offerPaymentOut = require('./cronjobs/offerPaymentOut')
const applyPaymentOut = require('./cronjobs/offerPaymentOut')
const memberUpgrade = require('./cronjobs/memberUpgrade')

const CronJob = require('cron').CronJob;

dayInterest()

//unfreeze.unfreezeMoney()
//memberUpgrade()
//offerPaymentOut()
//applyPaymentOut()

// */2 * * * * * runs every 2 second
// */3 * * * * * runs every 3 second
// 0 */3 * * * * runs every 3 minutes
// 0 */5 * * * * runs every 5 minutes

// //每天升级1次
// const memberUpgradeJob = new CronJob({
//     cronTime: '0 1 0 * * *',
//     onTick: function() {
//         console.log('===============================1')
//         console.log('run auto memberUpgrade')
//         memberUpgrade()
//     },
//     start: true,
//     timeZone: 'Asia/Shanghai'
// })
//
// //每日24点计算日结
// const dayInterestJob = new CronJob({
//     cronTime: '0 10 0 * * *',
//     onTick: function() {
//         console.log('===============================1')
//         console.log('run day interest')
//         dayInterest()
//     },
//     start: true,
//     timeZone: 'Asia/Shanghai'
// })
//
//
// //每5分钟自动匹配
// const matchJob = new CronJob({
//     cronTime: '0 */5 * * * *',
//     onTick: function() {
//         console.log('===============================1')
//         console.log('run auto match')
//         match()
//     },
//     start: true,
//     timeZone: 'Asia/Shanghai'
// })
//
//
//
// // 解冻本金
// const unFreezeMoneyJob = new CronJob({
//     cronTime: '0 */20 * * * *',
//     onTick: function() {
//         console.log('===========unFreezeMoneyJob')
//         unfreeze.unfreezeMoney()
//     },
//     start: true,
//     timeZone: 'Asia/Shanghai'
// })
//
// //解冻奖金
// const unFreezeBounsJob = new CronJob({
//     cronTime: '30 */20 * * * *',
//     onTick: function() {
//         console.log('===========unFreezeBonusJob')
//         unfreeze.unfreezeBonus()
//     },
//     start: true,
//     timeZone: 'Asia/Shanghai'
// })
//
// const applyPaymentOutJob = new CronJob({
//     cronTime: '10 */10 * * * *',
//     onTick: function() {
//         match()
//     },
//     start: true,
//     timeZone: 'Asia/Shanghai'
// })
//
// const offerPaymentOutJob = new CronJob({
//     cronTime: '40 */10 * * * *',
//     onTick: function() {
//         match()
//     },
//     start: true,
//     timeZone: 'Asia/Shanghai'
// })
