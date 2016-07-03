/**
 * Services for managing sessions (login/logout)
 */
define([
    'angular',
    'lodash',
    'angularBootstrap',
    'angularCache',
    'angularCookies',
    'ngIdle',
    'commons/events/commons-events',
    'commons/restapi/commons-restapi',
    'components/message-notifier/message-notifier-services'
], function(angular, _) {
    'use strict';

    var authenticationServices = angular.module('authenticationServices', ['ngCookies', 'angular-data.DSCacheFactory', 'ngIdle', 'commonsRestapi',, 'messageNotifierServices', 'commonsEvents', 'ui.bootstrap']);
    
    authenticationServices.service('authenticationService', ['$http', 'restapiService', 'messageNotifierService', '$rootScope', '$location', '$q', '$cookies', '$window', '$log', 'DSCacheFactory', 'events',
        function($http, restapiService, messageNotifierService, $rootScope, $location, $q, $cookies, $window, $log, DSCacheFactory, events) {

            var initialized = false;
            var user = null;

            var logger = $log.getInstance('authenticationService');

            /**
             * Log in a user (local login)
             * @param  Object credentials The user credentials (i.e. username / password)
             */
            this.login = function(credentials) {
                return $http.post(restapiService.restapi.authentication.LOCAL_LOGIN, {
                    'username': credentials.username,
                    'password': credentials.password,
                    cache: false
                });
            };

            //Disconnects a user
            this.logout = function() {
                //Clean cookieStore (because expiration on session does not work with angular)
                $cookies.remove('userLanguage');
                $cookies.remove('theme');

                //Clean cache
                DSCacheFactory.clearAll();

                //Reinitialize redirectUrl
                $rootScope.redirectUrl = '/';

                //Clean user
                user = null;

                //Redirect
                $http.get(restapiService.restapi.authentication.MODE).then(function(data) {
                    var mode = data.data;
                    if (mode === 'local') {
                        $http.post(restapiService.restapi.authentication.LOCAL_LOGOUT).catch(function(err) {
                            logger.error('Cannot log out : ' + err);
                        }).finally(function() {
                            $location.path('/login');
                            $rootScope.$broadcast(events['webgui.userLoggedOut']);
                        });
                    }
                    else if (mode === 'saml') {
                        $window.location.href = restapiService.restapi.authentication.SAML_LOGOUT;
                    }
                    else {
                        logger.error('Unknown authentication mode');
                        $location.path('/login');
                        $rootScope.$broadcast(events['webgui.userLoggedOut']);
                    }
                }).catch(function(err) {
                    logger.error('Cannot retrieve the authentication mode : ', err);
                    $location.path('/login');
                    $rootScope.$broadcast(events['webgui.userLoggedOut']);
                });
            };

            //Handle the connexion of a user (local login)
            this.handleLogin = function() {

                // Clean notifications & reset the message notifier state
                messageNotifierService.clearAll();
                messageNotifierService.setDefaultParameters();

                // Force user update at the next call of getUser method
                user = null;
                initialized = false;

                // we need to redirect to the initial URL after login (may be different from '/')
                // must protect the /login to avoid loop in redirection
                $location.url($rootScope.redirectUrl && $rootScope.redirectUrl !== '/login' ? $rootScope.redirectUrl : '/');
            };

            //Returns the current user from the JWT token
            this.getUser = function() {
                var deferred = $q.defer();

                if (initialized) {
                    deferred.resolve(user && !isPayloadExpired(user) ? user : null);
                }
                else {
                    $http.get(restapiService.restapi.authentication.TOKEN, {cache: false}).then(function(data) {
                        if (data.data) {
                            try {
                                var newUser = JSON.parse(atob(data.data.split('.')[1]));
                                var oldUser = angular.copy(user);

                                user = newUser;
                                $rootScope.user = angular.copy(newUser);

                                if (_.get(newUser, 'id') !== _.get(oldUser, 'id')) { //Fire a userLoggedIn event if this is a new user
                                    $rootScope.$broadcast(events['webgui.userLoggedIn']);
                                }
                            }
                            catch (e) {
                                deferred.reject('Cannot parse the JWT token: ' + e);
                            }
                        }
                        initialized = true;
                    }).catch(function(err) {
                        deferred.reject('Cannot retrieve the JWT token: ' + err);
                    }).finally(function() {
                        deferred.resolve(user && !isPayloadExpired(user) ? user : null);
                    });
                }

                return deferred.promise;
            };

            //Force user refresh at getUser function next call
            this.forceRefresh = function() {
                initialized = false;
            };

            //Returns whether the JWT payload is expired
            var isPayloadExpired = function(payload) {
                return payload.exp ? new Date(payload.exp * 1000) < new Date() : false;
            };
        }
    ]);

    //Access level constants
    authenticationServices.constant('accessLevel', {
        'anon': 'anon',
        'public': 'public',
        'user': 'user'
    });

    //Session sliding setup
    authenticationServices.run(['$http', '$log', '$rootScope', '$location', 'Idle', 'Keepalive', '$modalStack', 'restapiService', 'events', 'authenticationService',
        function($http, $log, $rootScope, $location, Idle, Keepalive, $modalStack, restapiService, events, authenticationService) {
            var logger = $log.getInstance('authenticationServices:run');

            $http.get(restapiService.restapi.authentication.SESSION_CONFIGURATION).then(function(data) {
                var sessionConfiguration = data.data;

                if (sessionConfiguration.sliding) {
                    var isViewDesignerRoute = function(path) {
                        var prefix = '/view-designer';
                        return path === prefix || path.slice(0, prefix.length) === prefix;
                    };

                    var refreshToken = function() {
                        $http.post(restapiService.restapi.authentication.TOKEN, {action: 'refresh', cache: false}).then(function() {
                            authenticationService.forceRefresh();
                        }).catch(function(err) {
                            logger.error('Cannot refresh the JWT token : ' + angular.toJson(err));
                        });
                    };

                    //Refresh jwt token periodically
                    $rootScope.$on('Keepalive', function() {
                        refreshToken();
                    });

                    //Log out user after max idle duration
                    $rootScope.$on('IdleTimeout', function() {
                        $rootScope.$evalAsync(function() {
                            $modalStack.dismissAll(); //Discard UI Bootstrap dialog boxes
                            $location.url('/logout');
                        });
                    });

                    //Start Idle & Keepalive timers on login if going to the view designer else start only Keepalive timer
                    $rootScope.$on(events['webgui.userLoggedIn'], function() {
                        isViewDesignerRoute($location.path()) ? Keepalive.start() : Idle.watch();
                    });

                    //Stop Idle & Keepalive timers on logout
                    $rootScope.$on(events['webgui.userLoggedOut'], function() {
                        Idle.unwatch();
                    });

                    //Watch for route changes
                    $rootScope.$on('$locationChangeSuccess', function() {
                        var path = $location.path();

                        //Stop Idle timer when going to the view designer
                        if (isViewDesignerRoute(path) && Idle.running()) {
                            Idle.unwatch();
                            Keepalive.start();
                        }
                        //For the other routes, start Idle timer if it is not already running (except /login)
                        else if (!isViewDesignerRoute(path) && path !== '/login' && !Idle.running()) {
                            Idle.watch();
                        }
                    });

                    //Configure Idle & Keepalive timers according to server configuration
                    if (sessionConfiguration.idleTimeout) {
                        Idle.setIdle(sessionConfiguration.idleTimeout);
                        Idle.setTimeout(1);
                    }

                    if (sessionConfiguration.refreshInterval) {
                        Keepalive.setInterval(sessionConfiguration.refreshInterval);
                    }
                }
            }).catch(function(err) {
                logger.error('Cannot retrieve session configuration : ' + err);
            });
        }
    ]);
});