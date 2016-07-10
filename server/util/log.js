const bunyan = require('bunyan')
const path = require('path')

const logpath = path.join(__dirname, '../logs')
console.log(logpath)

const log = bunyan.createLogger({
    name: 'DMDServer',
    streams: [{
        level: 'info',
        type: 'rotating-file',
        path: path.join(logpath, 'dmd_info.json'),
        period: '1d', // daily rotation
        count: 10 // keep 10 back copies
    }, {
        level: 'error',
        type: 'rotating-file',
        path: path.join(logpath, 'dmd_error.json'),
        period: '1d', // daily rotation
        count: 10 // keep 10 back copies
    }],
    serializers: {
        err: bunyan.stdSerializers.err,
        req: bunyan.stdSerializers.req,
        res: bunyan.stdSerializers.res
    },
    src: true // Optional, will record error occurs in which file   // Any other fields are added to all log records as is.
})


module.exports = log
