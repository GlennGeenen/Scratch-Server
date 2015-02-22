(function () {
    'use strict';

    var http = require('http');
    var url = require('url');
    var fs = require('fs');

    var otherIp = null;
    var port = 3333;

    var myProperties = [];
    var otherProperties = [];

    var myValues = [];
    var otherValues = [];

    function handleRequest(req, res) {

        var URL = url.parse(req.url);

        var l = 0;
        var i = 0;
        var value = 0;

        if (URL.pathname === '/poll') {
            var response = '';
            l = otherProperties.length;
            for (; i < l; ++i) {
                response += otherProperties[i] + ' ' + otherValues[i] + '\n';
            }
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(response);
        } else if (URL.pathname.indexOf('other') !== -1) {
            l = otherProperties.length;
            for (; i < l; ++i) {
                if (URL.pathname.indexOf(otherProperties[i]) !== -1) {
                    value = URL.pathname.substring(URL.pathname.lastIndexOf('/'));
                    otherValues[i] = value;
                    break;
                }
            }
            res.end();
        } else {
            l = myProperties.length;
            for (; i < l; ++i) {
                if (URL.pathname.indexOf(myProperties[i]) !== -1) {
                    value = URL.pathname.substring(URL.pathname.lastIndexOf('/'));
                    myValues[i] = value;
                    var options = {
                        hostname: otherIp,
                        port: port,
                        path: '/other/' + myProperties[i] + '/' + value,
                        method: 'POST'
                    };
                    http.request(options);
                    break;
                }
            }
            res.end();
        }
    }

    function start() {
        http.createServer(handleRequest).listen(port);
    }

    function addMyProperty(prop) {
        myProperties.push(prop);
    }

    function addOtherProperty(prop) {
        otherProperties.push(prop);
    }

    function setIp(ip) {
        otherIp = ip;
    }

    function setPort(p) {
        port = p;
    }

    function setupWithExtension(filepath, next) {
        fs.readFile(filepath, 'utf-8', function (err, fileContents) {
            if (err) {
                next(err);
            } else {
                var extension = JSON.parse(fileContents);
                setPort(extension.extensionPort);
                for (var i = 0; i < extension.blockSpecs.length; ++i) {
                    var prop = extension.blockSpecs[i];
                    if (prop[0] === ' ') {
                        addMyProperty(prop[2]);
                    } else {
                        addOtherProperty(prop[2]);
                    }
                }
            }
        });
    }

    module.exports = {
        start: start,
        addMyProperty: addMyProperty,
        addOtherProperty: addOtherProperty,
        setIp: setIp,
        setPort: setPort,
        setupWithExtension: setupWithExtension
    };
})();