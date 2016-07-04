// flightplan.js
var plan = require('flightplan');

// configuration
plan.target('develop', {
    host: '192.168.1.103',
    username: 'ubuntu',
    agent: process.env.SSH_AUTH_SOCK,
    failsafe: true
});

plan.target('product', {
    host: '121.41.166.117',
    username: 'root',
    agent: process.env.SSH_AUTH_SOCK,
    failsafe: true
});

var developPath = '/home/ubuntu/dmd_server';
var productPath = '/home/ubuntu';

// run commands on localhost
plan.local(function (local) {

    var files = local.exec('find ./server', { silent: false })
    local.transfer(files, developPath)
});

//deploy command
// fly develop -- development
// fly product -- product

//plan.remote(function (remote) {
//    remote.with('cd ' + productPath, function () {
//        remote.sudo("sed -i.bak 's/192.168.1.179/localhost/g' config.py");
//        //remote.sudo("sed -i.bak 's/192.168.1.179/test.fuwutb.com/g' config.py");
//    });
//});

//plan.remote(function (remote) {
//    remote.log('Reload application');
//    remote.sudo('supervisorctl stop all');
//    remote.sudo('supervisorctl start all');
//});
