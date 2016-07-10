"use strict"

const validator = require('validator')

module.exports = function (req, res, next) {
    if (req.params.num_iid) {
        validator.isNumeric(req.params.num_iid)
    }
}
