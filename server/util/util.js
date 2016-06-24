const crypto = require('crypto')

const getMD5 = (mobile) => {
    const a = crypto.createHash('md5').update(mobile).digest('hex')
    const b = crypto.createHash('sha1').update('tq2bf3Vx1qSnp' + mobile).digest('hex')
    const c = crypto.createHash('md5').update(a + b).digest('hex')
    const d = crypto.createHash('md5').update('uEF4d3cVbHDm2UuM9ew2Afn6kx7xC9gi2' + c).digest('hex')
    const e = crypto.createHash('md5').update(d + '5iYn5wUg0dNx2pncm%7LdGEuT-er5a6').digest('hex')
    return e
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const fail = (res, errorMessage, code) => {
    code == undefined || 0
    const message = {
        isSuccess: false,
        error: {
            message: errorMessage,
            code: code
        }
    }
    console.log(errorMessage)
    res.send(message)
}

const success = (res, data) => {
    data == undefined || {}
    const message = {
        isSuccess: true,
        data: data
    }
    res.send(message)
}

const util = {
    getMD5: getMD5,
    success: success,
    fail: fail,
    getRandomInt: getRandomInt
}

module.exports = util
