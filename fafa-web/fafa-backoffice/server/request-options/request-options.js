'use strict';

var fs = require('fs');
var path = require('path');

// build a request defaults object from a configuration object containing optional blocks
exports.buildRequestDefaults = function(conf,sslDir) {
    var requestDefaults = { agentOptions: {} };
    sslDir = sslDir || path.join(process.env.ROOT || '', 'server', 'public', 'ssl');
    // request base options, e.g.: gzip
    requestDefaults.gzip = (conf.gzip !== undefined) ? conf.gzip : true;
    // optional ssl block
    if (conf.ssl !== undefined) {
        var ssl = conf.ssl;
        if (ssl.strictSSL !== undefined) {
            requestDefaults.strictSSL = ssl.strictSSL;
        }
        if (ssl.caCertFile !== undefined) {
             requestDefaults.agentOptions.ca = fs.readFileSync(path.join(sslDir,ssl.caCertFile));
        }
        if (ssl.certFile !== undefined) {
             requestDefaults.agentOptions.cert = fs.readFileSync(path.join(sslDir,ssl.certFile));
        }
        if (ssl.keyFile !== undefined) {
             requestDefaults.agentOptions.key = fs.readFileSync(path.join(sslDir,ssl.keyFile));
        }
        if (ssl.passphrase !== undefined) {
             requestDefaults.agentOptions.passphrase = ssl.passphrase;
        }
        if (ssl.securityOptions !== undefined) {
             requestDefaults.agentOptions.securityOptions = ssl.securityOptions;
        }
        if (ssl.secureProtocol !== undefined) {
             requestDefaults.agentOptions.secureProtocol = ssl.secureProtocol;
        }
    }
    return requestDefaults;
};
