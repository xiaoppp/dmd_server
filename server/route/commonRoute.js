"use strict"
const top = require('../top/TopHelper')

module.exports = function(server) {
    server.get('/', (req, res, next) => res.send("welcome zhekou backend api server..."));
    server.get('/hello/:name', respond);
    server.head('/hello/:name', respond);

    function respond(req, res, next) {
        console.log(top);
        top.get_onsale_items().then(data => res.send(data));
        next();
    }
}
