const crypto = require('crypto')

const getMD5 = (mobile) => {
    const a = crypto.createHash('md5').update(mobile).digest('hex')
    const b = crypto.createHash('sha1').update('tq2bf3Vx1qSnp' + mobile).digest('hex')
    const c = crypto.createHash('md5').update(a + b).digest('hex')
    const d = crypto.createHash('md5').update('uEF4d3cVbHDm2UuM9ew2Afn6kx7xC9gi2' + c).digest('hex')
    const e = crypto.createHash('md5').update(d + '5iYn5wUg0dNx2pncm%7LdGEuT-er5a6').digest('hex')
    return e
}

const APIResult = () => {
    return {
        isSuccess: false,
        error: {
            message: "",
            code: 0
        }
    }
}

const util = {
    getMD5: getMD5,
    APIResult: APIResult
}

module.exports = util
