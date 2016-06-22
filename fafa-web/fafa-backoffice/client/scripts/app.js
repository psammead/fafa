'use strict';

var xmlhttp = new XMLHttpRequest();

xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        var response = JSON.parse(xmlhttp.responseText);
        console.log(response);

        var scriptDependency = [
            'angular',
            'logDecorator',
            'angularRoute',
            'angularResource',
            'angularCookies',
            'angularSanitize',
            'angularBootstrap',
            'jquery',
            'bootstrap',
            'angularTranslate',
            'angularTranslatePartialLoader',
            'angularDynamicLocale',
            'angularCache',
            'checklistModel',
            'bootstrapDecorator'
        ];

        var moduleDependency = [
            'ngCookies',
            'ngResource',
            'ngSanitize',
            'ngRoute',
            'ui.bootstrap',
            'angular-data.DSCacheFactory',
            'pascalprecht.translate',
            'tmh.dynamicLocale',
            'languageConfig',
            'themeConfig',
            'userPreferences',
            'schemaForm'
        ];

        scriptDependency = scriptDependency.concat(response.scriptList);
        moduleDependency = moduleDependency.concat(response.moduleList);

        define(scriptDependency, function(angular, logDecorator) {

            /** 
             * Protect UI routes based on an access level (user/anon/public) and optionnaly permissions
             * If an user is authenticated and tries to access to a route reserved to anonymous users, he is redirected to the main page
             * Likewise if an annonymous user tries to access to a route reserved to authenticated users, he is redirected to the login page
             * If an user has not the permissions to access a given route, he is redirected to /forbidden
             * @param {String} access       Access level of the route
             * @param {String} permissions  Optionnal comma separated list of required permissions
             */
            var requireAccess = function(access, permissions) {
                return ['$location', '$q', '$log', 'authenticationService', 'accessLevel', 'permissionHandlerService',
                    function($location, $q, $log, authenticationService, accessLevel, permissionHandlerService) {
                        return requireAccessFunction($location, $q, $log, authenticationService, accessLevel, permissionHandlerService, access, permissions);
                    }
                ];
            };

            var requireAccessFunction = function($location, $q, $log, authenticationService, accessLevel, permissionHandlerService, access, permissions) {
                var deferred = $q.defer();
                var logger = $log.getInstance('app');

                authenticationService.getUser().then(function(user) {
                    if (!user) {
                        (access === accessLevel.user) ? $location.url('/login') : deferred.resolve();
                    } else {
                        if (access === accessLevel.anon) {
                            $location.url('/');
                        } else {
                            permissionHandlerService.initialize().then(function() {
                                (permissions && !permissionHandlerService.hasPermission(permissions)) ? $location.url('/forbidden') : deferred.resolve();
                            }).then(null, function(err) {
                                logger.error('Cannot initialize the permission handler. Err: ', err);
                                deferred.reject();
                            });
                        }
                    }
                }).then(null, function(err) {
                    logger.error('Cannot get the current user. Err: ', err);
                    (access === accessLevel.user) ? $location.url('/login') : deferred.resolve();
                });

                return deferred.promise;
            };

            /**
             * Check the authentication mode and redirect if needed to SAML IDP
             */
            var authenticationMode = ['$http', '$q', '$window', 'restapiService',
                function($http, $q, $window, restapiService) {
                    var deferred = $q.defer();
                    
                    $http.get(restapiService.restapi.authentication.MODE).then(function(data) {
                        if (data.data === 'saml') {
                            $window.location.href = restapiService.restapi.authentication.SAML_LOGIN;
                        } else {
                            deferred.resolve();
                        }
                    });

                    return deferred.promise;
                }
            ];

            /**
             * Handle the logout of a user depending on the current authentication mode
             */
            var logoutRedirect = ['authenticationService', function(authenticationService) {
                authenticationService.logout();
            }];

            /**
             * Preinitialize the userPreferencesService and applies new settings
             */
            var initUserPreferences = ['userPreferencesService', function(userPreferencesService) {
                return userPreferencesService.initUserPreferences();
            }];

            return angular.module('fafaApp', moduleDependency)
                .config(['$routeProvider', '$locationProvider', '$httpProvider', 'accessLevel', 'DSCacheFactoryProvider',
                    function($routeProvider, $locationProvider, $httpProvider, accessLevel, DSCacheFactoryProvider) {
                        $routeProvider
                            .when('/', {
                                templateUrl: 'partials/main',
                                controller: 'mainController',
                                resolve: {
                                    'access': requireAccess(accessLevel.user),
                                    'preferences': initUserPreferences
                                }
                            })
                            .when('/login', {
                                templateUrl: '../components/authentication/authentication.html',
                                controller: 'authenticationController',
                                resolve: {
                                    'access': requireAccess(accessLevel.anon),
                                    'mode': authenticationMode,
                                    'preferences': initUserPreferences
                                }
                            })
                            .when('/forbidden', {
                                templateUrl: 'partials/403.html',
                                resolve: {
                                    'access': requireAccess(accessLevel.user),
                                    'preferences': initUserPreferences
                                }
                            })
                            .when('/logout', {
                                resolve: {
                                    'redirect': logoutRedirect,
                                }
                            })
                            // This 404 webpage should be handled by express (because all components/client modules are loaded before displaying its content)
                            .when('/404', {
                                templateUrl: 'partials/404.html',
                                resolve: {
                                    'access': requireAccess(accessLevel['public']),
                                    'preferences': initUserPreferences
                                }
                            })
                            .otherwise({
                                templateUrl: 'partials/404.html',
                                resolve: {
                                    'access': requireAccess(accessLevel['public']),
                                    'preferences': initUserPreferences
                                }
                            });

                        $locationProvider.html5Mode(true);

                        //fix bug IE 10 - Prevent IE xhr request caching
                        if (!$httpProvider.defaults.headers.get) {
                            $httpProvider.defaults.headers.get = {};
                        }
                        
                        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache, no-store, must-revalidate';
                        $httpProvider.defaults.headers.get.Pragma = 'no-cache';

                        //# Default cache configuration
                        DSCacheFactoryProvider.setCacheDefaults({
                            maxAge: 3600000,
                            recycleFreq: 60000,
                            deleteOnExpire: 'aggressive'
                        });
                    }
                ])

            // enhance angular $log (it also sets the client logger configuration, like 'debugEnabled')
            .config(logDecorator)

            .run(['$rootScope', '$location', '$http', '$translate', '$log', 'DSCacheFactory',
                function($rootScope, $location, $http, $translate, $log, DSCacheFactory) {
                    // Set the default theme while the platform theme loads
                    $rootScope.userTheme = 'hpe_light';
                    $rootScope.userThemeLocation = '/themes/hpe_light';

                    // configure logger: activate debug if and only if query parameter 'debug' is defined
                    if ($location.search().debug !== '1') {
                        $log.disableDebug();
                    }

                    // keep the initial url (in case of redirection after succesfull login)
                    $rootScope.redirectUrl = $location.url();

                    //# Default http cache configuration
                    DSCacheFactory('httpCache'); // jshint ignore:line
                    $http.defaults.cache = DSCacheFactory.get('httpCache');

                    //Report mode flag. Allows some components to adapt their display (i.e hide some contents and whatnot)
                    $rootScope.reportMode = $location.search().report === 'true';
                }
            ]);
        });
    }
};

xmlhttp.open('GET', '/dependency', false);
xmlhttp.send();