/**
 * User Preferences services
 */

define([
        'angular',
        'lodash',
        'commons/constants',
        'angularCache',
        'commons/restapi/commons-restapi',
        'components/theme-config/theme-config-services',
        'components/language-config/language-config-services',
        'components/authentication/authentication-services'
    ],
    function(angular, _, constants) {
        'use strict';

        var userPreferencesServices = angular.module('userPreferencesServices', ['angular-data.DSCacheFactory', 'commonsRestapi', 'themeConfigServices', 'languageConfigServices', 'authenticationServices']);

        userPreferencesServices.service('userPreferencesService', ['$rootScope', '$http', '$q', '$log', '$document', '$location', '$window', '$translate', 'DSCacheFactory', 'restapiService', 'themeConfigService', 'languageConfigService', 'authenticationService',
            function($rootScope, $http, $q, $log, $document, $location, $window, $translate, DSCacheFactory, restapiService, themeConfigService, languageConfigService, authenticationService) {
                var userPreferences = {};
                var that = this;
                var logger = $log.getInstance('userPreferencesService');

                var _userId = null; //Latest user id known. The service data is updated at user change.

                // Available languages List
                var languageList = [];
               
                var refreshLanguages = function() {
                    languageConfigService.getLanguages().then(function(languages) {
                        if (Array.isArray(languages.data.list)) {
                            languages.data.list.forEach(function(language) {
                                languageList.push(language.languageCode);
                            });
                        }
                        // optimize language: true per default
                        // parameter set in server config
                        if (languages.data.optimizeL10n) {
                            languageConfigService.optimizeL10n(languages.data.parts);
                        }
                        // load translation
                        $translate.refresh();
                    }).then(null, function(error) {
                        logger.error('Cannot get list of languages', error);
                        // load translation
                        $translate.refresh();
                    });
                };
                refreshLanguages();

                this.initUserPreferences = function() {
                    var deferred = $q.defer();

                    authenticationService.getUser().then(function(data) {
                        var user = data || {};

                        if (user.id !== _userId) { //The user has changed, update data
                            $http.get(restapiService.restapi.userPreferences.USER_PREFERENCES, {
                                cache: DSCacheFactory.get('userPreferencesCache')
                            }).success(function(platformPrefs) {
                                var userPrefs = user.preferences || {};
                                var newPrefs = _.extend({}, platformPrefs, userPrefs);

                                _userId = user.id;
                                //Override language if specified as query parameter
                                var langUrl = $location.search().lang;
                                if (langUrl) {
                                    newPrefs.language = langUrl;
                                    $location.search('lang', null);
                                }
                                applyPreferences(newPrefs).then(function() {
                                    languageConfigService.changeLanguage(that.getLanguage());
                                    deferred.resolve();
                                });
                            }).error(function(e) {
                                logger.warn('Cannot retrieve the platform preferences ', e);
                                deferred.resolve();
                            });
                        } else {
                            deferred.resolve();
                        }
                    }).catch(function(e) {
                        logger.warn('Cannot retrieve the current user ', e);
                        deferred.resolve();
                    });

                    return deferred.promise;
                };

                var applyPreferences = function(preferences) {
                    var deferred = $q.defer();

                    //Update the internal preferences object
                    userPreferences = preferences;

                    //Update title
                    $document[0].title = that.getTitle();

                    //Update theme
                    themeConfigService.changeTheme(that.getTheme()).then(function() {
                        deferred.resolve();
                    }).catch(function(error) {
                        logger.error('Error while switching to the theme ', that.getTheme(), '. Fallback on the default theme(', constants.DEFAULT_THEME, '). Err: ', error);
                        themeConfigService.changeTheme(constants.DEFAULT_THEME).catch(function(error) {
                            logger.error('Error while switching to the default theme. Err: ', error);
                        }).finally(function() {
                            deferred.resolve();
                        });
                    });

                    return deferred.promise;
                };

                // public interface to access to identifier, name and associated roles
                // ex: {"id":"admin","name":"Administrator","roles":["Platform Administrator","User Administrator"]}
                this.getUser = function() {
                    return $rootScope.user;
                };


                this.getTitle = function() {
                    if (userPreferences && userPreferences.title) {
                        return userPreferences.title;
                    } else {
                        return constants.DEFAULT_TITLE;
                    }
                };

                this.getVersion = function() {
                    if (userPreferences && userPreferences.version) {
                        // apply the special keyword to dynamically apply the version.                     
                        var re = new RegExp('(' + constants.DEFAULT_VERSION_KEYWORD + ')', 'gi');
                        userPreferences.version = userPreferences.version.replace(re, constants.DEFAULT_VERSION);
                        return userPreferences.version;
                    } else {
                        return constants.DEFAULT_VERSION;
                    }
                };

                this.getLink = function() {
                    if (userPreferences && userPreferences.link) {
                        return userPreferences.link;
                    } else {
                        return constants.DEFAULT_LINK;
                    }
                };

                this.getTheme = function() {
                    if (userPreferences && userPreferences.theme) {
                        return userPreferences.theme;
                    } else {
                        return constants.DEFAULT_THEME;
                    }
                };

                // we allow setTheme to support preview of theme selection
                this.setTheme = function(themeId) {
                    userPreferences.theme = themeId;
                };

                this.getLanguage = function() {
                    if (userPreferences && userPreferences.language) {
                        return userPreferences.language;
                    } else {
                        // Try to use the browser locale

                        var browserLanguage = $window.navigator.language || $window.navigator.browserLanguage || $window.navigator.userLanguage || $window.navigator.systemLanguage;
                        var language;

                        if (browserLanguage) {
                            // Try to find browserLanguage-browserLanguage combination
                            _.forOwn(languageList, function(l) {
                                if (l.toLowerCase() === browserLanguage.toLowerCase() + '-' + browserLanguage.toLowerCase()) {
                                    language = l;
                                }
                            });

                            // If language not found yet, try to find browserLanguage* combination
                            if (!language) {
                                var re = new RegExp("^" + browserLanguage, "i");

                                _.forOwn(languageList, function(l) {
                                    if (l.match(re)) {
                                        language = l;
                                    }
                                });
                            }

                            return language || constants.DEFAULT_LANGUAGE;

                        } else {
                            return constants.DEFAULT_LANGUAGE;
                        }
                    }
                };

                // we allow setLanguage to support language selection at runtime
                this.setLanguage = function(langKey) {
                    userPreferences.language = langKey;
                };

                this.getShowMenuBar = function() {
                    var visible = constants.DEFAULT_SHOW_MENU_BAR_FLAG; // default always visible
                    if (userPreferences.showMenuBar === true || userPreferences.showMenuBar === false) {
                        visible = userPreferences.showMenuBar;
                    }
                    return visible;
                };

                this.getMenuBar = function() {
                    if (userPreferences && userPreferences.menuBar) {
                        return userPreferences.menuBar;
                    } else {
                        return constants.DEFAULT_MENU_BAR;   // if the menuBar is not set. we use default menu bar
                    }
                };

                this.getShowWorkspaceManager = function() {
                    var visible = constants.DEFAULT_SHOW_WORKSPACE_MANAGER_FLAG; // default always visible
                    if (userPreferences.showWorkspaceManager === true || userPreferences.showWorkspaceManager === false) {
                        visible = userPreferences.showWorkspaceManager;
                    }
                    return visible;
                };

                this.getInitialWorkspace = function() {
                    if (userPreferences && userPreferences.initialWorkspace) {
                        return userPreferences.initialWorkspace;
                    } else {
                        return constants.DEFAULT_INITIAL_WORKSPACE;
                    }
                };

                this.clearCache = function() {
                    logger.debug('Clearing cache...');
                    DSCacheFactory.get('userPreferencesCache').removeAll();
                };
            }
        ]);

        return userPreferencesServices;
    });
