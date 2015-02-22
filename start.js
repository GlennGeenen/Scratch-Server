(function () {
    'use strict';

    var server = require('./server.js');
    server.setupWithExtension('./extension.json', function (err) {
        if (err) {
            console.log(err.message);
        } else {
            server.setIp('192.168.0.300');
            server.start();
        }
    });
})();