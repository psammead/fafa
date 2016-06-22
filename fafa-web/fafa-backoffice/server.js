'use strict';

// used to comptue start time duration
var startTime = new Date(); 

var express = require('express'),
    passport = require('passport'),
    nconf = require('nconf'),
    path = require('path'),
    util = require('util'),
    compression = require('compression'),   // enable gzip (default threshold: 1024 bytes)
    os = require('os');                     // acces to ssytem info of the platform

/**
 * Main application file
 */

// Setup nconf to use (in-order):
//   1. Command-line arguments
//   2. Environment variables
//   3. A file located at './conf/config.json'

nconf.argv().env().file({
    file: __dirname + '/server/public/conf/config.json'
});

process.env.PROTOCOL = nconf.get('server:protocol') || 'http';
process.env.PORT = process.env.PORT || nconf.get('server:port') || 3000;
process.env.TIMEOUT = parseInt(process.env.TIMEOUT || nconf.get('server:timeout') || 0, 10);
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.AUTH_MODE = nconf.get('authentication:mode') || 'local';
process.env.ROOT = path.normalize(__dirname);

var app = express();

// Add content compression middleware with default value: threshold 1024 bytes to enable compression. 
// This can be tuned. check https://www.npmjs.org/package/compression 
app.use(compression());

//Passport settings
var configurePassport = require('./server/config/passport')[process.env.AUTH_MODE];
if (configurePassport) {
    configurePassport(passport);
} else {
    throw {
        name: 'Unsupported authentication mode'
    };
}

var logger = require(path.join(process.env.ROOT, 'server', 'logger', 'server-logger'));
var platformLogger = require(path.join(process.env.ROOT, 'server', 'logger', 'platform-logger'));

// Express settings
require('./server/config/express')(app);

// Application routes
require('./server/routes')(app);

// Couchdb minimum version 1.6.0
var COUCHDB_MINIMUM_VERSION = '1.6.0';

// TLS Secure Protocol
var secureProtocol;

var logError = function(msg) {
    process.stderr.write(msg);
    logger.error(msg);
};

var logInfo = function(msg) {
    process.stdout.write(msg+'\n');
    platformLogger.info(msg);
};

logInfo('');
logInfo('+=====================+');
logInfo('+ Back office +');
logInfo('+=====================+');
var httpServer;
if (process.env.PROTOCOL === 'https') {
    var options = {};
    var fs = require('fs');
    var sslDir = path.join(process.env.ROOT, 'server', 'public', 'ssl');
    options.key = fs.readFileSync(path.join(sslDir, nconf.get('server:privateKey')), 'utf-8');
    options.cert = fs.readFileSync(path.join(sslDir, nconf.get('server:certificate')), 'utf-8');
    secureProtocol = nconf.get('server:secureProtocol') !== undefined ? nconf.get('server:secureProtocol') : "TLSv1_2_method";
    options.secureProtocol = secureProtocol;
    httpServer = require(process.env.PROTOCOL).createServer(options, app);
} else {
    httpServer = require(process.env.PROTOCOL).createServer(app);
}

//Check if httpServer has method setTimeout. Node version < 0.12.0
if (httpServer.setTimeout) {
    httpServer.setTimeout(process.env.TIMEOUT * 1000);
}

httpServer.listen(process.env.PORT, function() {
    // save specify informaiton to platform.log to ease platform troubleshooting
    logInfo('OS hostname: '+os.hostname());
    logInfo('OS Type: '+os.type());
    logInfo('Platform: '+os.platform());
    logInfo('Release: '+os.release());
    platformLogger.info('CPUs:'+JSON.stringify(os.cpus()));
    platformLogger.info('Total Mem:'+ os.totalmem()+' bytes');
    platformLogger.info('Free Mem:'+ os.freemem()+' bytes');

    // Note: we do not uses console.log here to keep these message after minification
    logInfo(util.format('Server listening on port %d', process.env.PORT));

    logInfo(util.format('Server protocol is %s', process.env.PROTOCOL));
    if (secureProtocol !== undefined) {
        logInfo(util.format('Server Secure Protocol is %s', secureProtocol));
    }

    if (httpServer.setTimeout) {
        logInfo(util.format('Server timeout is %s', (process.env.TIMEOUT * 1) === 0 ? 'unlimited' : ('' + process.env.TIMEOUT + 's')));
    } else {
        logInfo('Server timeout is N/A');
    }

    var bodyParserLimit = nconf.get('bodyParser:limit');
    if (bodyParserLimit !== undefined) {
        logInfo(util.format('Server BodyParser limit is %s', bodyParserLimit));
    }
    logInfo(util.format('Node Environment is %s', process.env.NODE_ENV));

    logInfo(util.format('Node Root is %s', process.env.ROOT));
    logInfo(util.format('Authentication mode is %s', process.env.AUTH_MODE));

        // used to comptue start time duration
    var endTime = new Date();
    logInfo("Fafa backoffice started in " + (endTime.getTime() - startTime.getTime()) + " ms...");
});

// Expose app
exports = module.exports = app;
