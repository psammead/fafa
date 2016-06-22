'use strict';

var express = require('express'),
    path = require('path'),
    ejs = require('ejs'),
    passport = require('passport'),
    nconf = require('nconf'),
    jwt = require('jsonwebtoken'),
    _ = require('lodash'),
    helmet = require('helmet'),
    csp = require('helmet-csp'),
    csurf = require('csurf'),

    expressLogger = require('../logger/express-logger'),
    serverLogger = require('../logger/server-logger'),
    root = process.env.ROOT,
    nconf = require('nconf'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    expressValidator = require('express-validator');

nconf.argv().env().file({
  file: path.join(process.env.ROOT, 'server/public/conf/config.json')
});

//SAML routes called by the IdP. Must be excluded from CRSF protection
var CRSF_WHITELIST = [
    '/auth/saml/callback',
    '/'
];

/**
 * Express configuration
 */

console.log('root:', root);

module.exports = function(app) {

    //Helmet security middlewares
    app.use(helmet.xssFilter());        //Enable browser built-in XSS protection
    app.use(helmet.hidePoweredBy());    //Hide X-Powered-By header
    app.use(helmet.noSniff());          //Do not infer MIME type

    var cspConfig = nconf.get('csp');   //Enable Content Security Policy
    if (cspConfig) {
        serverLogger.info('Content Security Policy (CSP) protection is enabled');        
        app.use(csp(cspConfig));
    } else {
        serverLogger.warn('Content Security Policy (CSP) protection is disabled');                
    }

    if (process.env.NODE_ENV === 'development') {
        app.use(helmet.noCache());
        
        //Livereload. Disabled by default due to file corruption. See https://github.com/intesso/connect-livereload/issues/39
        // app.use(require('connect-livereload')());
    }
    //Serve files under client as static files (cache 1 day)
    var oneDay = 86400000;
    app.use(express.static(path.join(root, 'client'), {
        maxAge: oneDay
    }));

    //Views related settings
    app.engine('html', ejs.renderFile);
    app.set('views', root + '/client/views');
    app.set('view engine', 'html');

    // Body parsing middleware
    // Check first if bodyParser limit has been modified in the configuration (default is 100kb)
    // Controls the maximum request body size. 
    // If this is a number, then the value specifies the number of bytes; 
    // if it is a string, the value is passed to the bytes library for parsing. Defaults to '100kb'.
    var bodyParserLimit = nconf.get('bodyParser:limit');
    app.use((bodyParserLimit!== undefined)?bodyParser.json({limit: bodyParserLimit}) : bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    //Express-validator
    app.use(expressValidator());

    //Cookies
    app.use(cookieParser());

    //Csrf protection
    var disabledCrsfProtection = nconf.get('disableCrsfProtection');
    if (!disabledCrsfProtection) {
        serverLogger.info('Cross-Site Request Forgery (CSRF) protection is enabled');        
        app.use(csurf({
            cookie: {
                httpOnly: true
            }
        }));

        app.use(function(req, res, next) {
            if (!req.cookies['XSRF-TOKEN']) { //Skip if the CRSF token has already been set. 'XSRF-TOKEN' cookie name is an Angular convention
                res.cookie('XSRF-TOKEN', req.csrfToken());
            }
            next();
        });

        //Handle CSRF token errors
        app.use(function(err, req, res, next) {
            if (err && err.code === 'EBADCSRFTOKEN') {
                if (!_.includes(CRSF_WHITELIST, req.path)) {
                    res.status(403).send('Invalid CRSF token');
                }
                else {
                    next();
                }
            }
            else {
                next(err);
            }
        });
    } else {
        serverLogger.warn('Cross-Site Request Forgery (CSRF) protection is disabled');                
    }
    
    //Custom Express logger (LOG4JS)
    app.use(expressLogger);

    //Passport support
    app.use(passport.initialize());

    //Populate req.token & deserialize user from JWT token, coming from http header or cookie
    app.use(function(req, res, next) {
        var token = (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') ? req.headers.authorization.split(' ')[1] : req.cookies.token;

        if (token) {
            var jwtOptions = {
                algorithms: [nconf.get('authentication:jwt:algorithm')]
            };

            jwt.verify(token, nconf.get('authentication:jwt:secret'), jwtOptions, function(err, decoded) {
                if (err) {
                    serverLogger.error('An error occured while verifying token : ', err);
                }
                else {
                    req.user = _.omit(decoded, ['iat', 'exp']);
                    req.token = token;
                }
                next();
            });
        }
        else {
            next();
        }
    });

    process.on('uncaughtException', function(err) {
        console.error('Uncaught Exception: ', (err && err.stack ? err.stack : err));
    });
};
