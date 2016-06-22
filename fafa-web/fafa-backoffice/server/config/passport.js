'use strict';

var LocalStrategy = require('passport-local').Strategy,
    SamlStrategy = require('passport-saml').Strategy,
    nconf = require('nconf'),
    xml2js = require('xml2js'),
    fs = require('fs'),
    path = require('path');


var hashUtils = require(path.join(process.env.ROOT, 'server', 'utils', 'hashUtils.js'));
var serverLogger = require(path.join(process.env.ROOT, 'server', 'logger', 'server-logger'));

//Passport local configurtion
exports.local = function(passport) {
    passport.use(new LocalStrategy(function(username, password, done) {
//        db.view('users', 'by_user_id', {
//            keys: [username]
//        }, function(err, body) {
//            if (err) {
//                done(err, false);
//            } else {
//                if (body && body.rows.length) {
//                    var dbUser = body.rows[0].value;
//
//                    hashUtils.verifyHash(password, dbUser.password, function(err, match) {
//                        if (err) {
//                            done(err, false);
//                        } else {
//                            if (!match) {
//                                done(null, false);
//                            } else {
//                                return done(null, dbUser);
//                            }
//                        }
//                    });
//                } else {
//                    done(null, false);
//                }
//            }
//        });
        var users = fs.readdirSync(path.join(process.env.ROOT, 'server', 'monitor', 'users.json'));
        if(users.length > 0) {
            users.forEach(function(user){
                if(user.user_id === username) {
                    if( user.password === password) {
                        return done(null, user);
                    }
                    done(null, false);
                }
            });
        }
        done(null, false);
    }));
};

//Passport SAML configuration
exports.saml = function(passport) {

    var settings = {
        protocol: process.env.PROTOCOL + '://',
        path: '/auth/saml/callback',
        entryPoint: nconf.get('saml:idp:entryPoint'),
        identifierFormat: nconf.get('saml:idp:identifierFormat'),
        issuer: nconf.get('saml:sp:issuer'),
        acceptedClockSkewMs: nconf.get('saml:idp:acceptedClockSkewMs') || 0
    };

    var certDir = path.join(process.env.ROOT, 'server', 'public', 'ssl');
    var signature = nconf.get('saml:signature');
    var encryption = nconf.get('saml:encryption');
    var postAuthCallback = nconf.get('saml:postAuthCallback');
    var postAuthCallbackModule;
    var samlStrategyCallback;

    //Extract informations from the SAML assertion manually
    var defaultSamlStrategyCallback = function(profile, done) {
        var parser = xml2js.parseString;
        var user = {
            nameID: profile.nameID,
            nameIDFormat: profile.nameIDFormat,
            sessionIndex: profile.sessionIndex,
            roles: [],
            preferences: {}
        };

        parser(profile.getAssertionXml(), function(err, result) {
            if (err) {
                done(err);
            }
            else {
                try {
                    result['saml:Assertion']['saml:AttributeStatement'][0]['saml:Attribute'].forEach(function(attribute) {
                        if (attribute.$.Name === 'Role') {
                            user.roles.push(attribute['saml:AttributeValue'][0]._);
                        }
                        else if (attribute.$.Name === 'Tenant') {
                            user.tenant_id = attribute['saml:AttributeValue'][0]._;
                        }
                        else if (attribute.$.Name === 'Link') {
                            user.preferences.link = attribute['saml:AttributeValue'][0]._;
                        }
                        else if (attribute.$.Name === 'Language') {
                            user.preferences.language = attribute['saml:AttributeValue'][0]._;
                        }
                        else if (attribute.$.Name === 'Theme') {
                            user.preferences.theme = attribute['saml:AttributeValue'][0]._;
                        }
                        else if (attribute.$.Name === 'MenuBar') {
                            user.preferences.menuBar = attribute['saml:AttributeValue'][0]._;
                        }
                        else if (attribute.$.Name === 'ShowWorkspaceManager') {
                            user.preferences.showWorkspaceManager = attribute['saml:AttributeValue'][0]._;
                        }
                        else if (attribute.$.Name === 'InitialWorkspace') {
                            user.preferences.initialWorkspace = attribute['saml:AttributeValue'][0]._;
                        }
                        else {
                            //Custom attribute is taken as is
                            user[attribute.$.Name] = attribute['saml:AttributeValue'][0]._;
                        }
                    });
                }
                catch (e) {
                    done(e);
                }
            }
        });

        return done(null, user);
    };

    if (signature) {
        settings.cert = fs.readFileSync(path.join(certDir, nconf.get('saml:idp:certificate')), 'utf-8');
        settings.privateCert = fs.readFileSync(path.join(certDir, nconf.get('saml:sp:privateKey')), 'utf-8');
    }
    if (encryption) {
        settings.decryptionPvk = fs.readFileSync(path.join(certDir, nconf.get('saml:sp:privateKey')), 'utf-8');
    }

    samlStrategyCallback = defaultSamlStrategyCallback;
    passport.use(new SamlStrategy(settings, samlStrategyCallback));
};