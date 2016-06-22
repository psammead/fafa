/**
 * RestAPI URL list
 */
define([
        'angular',
        'commons/constants'
    ],
    function(angular, constants) {
        'use strict';
        return angular.module('commonsRestapi', [])
            .service('restapiService', [
                function() {
                    this.VERSION = constants.RESTAPI_VERSION;
                    this.restapi = {
                        users: {
                            USERS: '/users',
                            ADD_USER: '/users', // POST
                            UPDATE_USER: '/users/{1}', // PUT
                            DELETE_USER: '/users/{1}/revision/{2}',
                            CHANGE_PASSWORD: '/users/{1}/password', //PUT
                            CHANGE_PREFERENCES: '/users/{1}/preferences'     //PUT
                        },
                        permissions: {
                            PERMISSIONS: '/permissions',
                            USER_PERMISSIONS: '/permissions/user'
                        },
                        roles: {
                            ROLES: '/roles',
                            ADD_ROLE: '/roles', // POST
                            UPDATE_ROLE: '/roles/{1}', // PUT
                            DELETE_ROLE: '/roles/{1}/revision/{2}'
                        },
                        authentication: {
                            LOCAL_LOGIN: '/auth/local/login',
                            LOCAL_LOGOUT: '/auth/local/logout',
                            SAML_LOGIN: '/auth/saml/login',
                            SAML_LOGOUT: '/auth/saml/logout',
                            MODE: '/auth/mode',
                            USER: '/auth/loggedin',
                            TOKEN: '/auth/token',
                            SESSION_CONFIGURATION: '/auth/session/configuration'
                        },
                        menuBars: {
                            MENU_BARS: '/menu-bars',
                            MENU_BARS_BY_ID: '/menu-bars/{1}'
                        },
                        menuItems: {
                            MENU_ITEMS: '/menu-items',
                            MENU_ITEMS_BY_ID: '/menu-items/{1}',
                        },
                        themes: {
                            THEMES: '/themes',
                            THEMES_BY_ID: '/themes/{1}',
                            THEMES_CSS: '/themes/{1}/css'
                        },
                        userPreferences: {
                            USER_PREFERENCES: '/user-preferences'
                        },
                        languages: {
                            LANGUAGES: '/languages',
                            LANGUAGE_BY_ID: '/languages/{1}'
                        }
                    };

                    this.format = function() {
                        // console.log('nb:', arguments.length, '[0]', arguments[0], '("0")', arguments['0']);
                        var args = arguments;
                        var text = args[0];
                        return text.replace(/{(\d+)}/g, function(match, number) {
                            // console.log(number, ' typeof:', typeof args[number], args[number], args[number] instanceof Array)
                            var arg = args[number];
                            if (typeof args[number] === 'undefined') {
                                return match;
                            }
                            if (arg.restformat) {
                                // this is a complex object that needs to be formatted in the url
                                var res = '';
                                for (var data in arg.data) {
                                    if (arg.data.hasOwnProperty(data)) {
                                        if (res.length > 0) {
                                            res += arg.separator;
                                        }
                                        res += arg.data[data];
                                    }
                                }
                                return res;
                            } else {
                                return arg;
                            }
                        });
                    };

                }
            ]);
    });