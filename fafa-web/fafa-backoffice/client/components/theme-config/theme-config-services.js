/**
 * Theme services
 */

define([
        'angular',
        'lodash',
        'jquery',
        'angularCache',
        'commons/events/commons-events',
        'commons/restapi/commons-restapi',
        'angularCookies'        
    ],
    function(angular, _, $) {
        'use strict';

        var themeConfigServices = angular.module('themeConfigServices', ['commonsRestapi', 'commonsEvents', 'angular-data.DSCacheFactory','ngCookies']);

        themeConfigServices.service('themeConfigService', ['$http', '$q', '$log', '$rootScope', 'restapiService', 'DSCacheFactory', 'events','$cookies',
            function($http, $q, $log, $rootScope, restapiService, DSCacheFactory, events, $cookies) {
                var logger; //Lazily instanciated logger

                var CSS_DIRECTORY_PATH = '/css/';
                var themeHighcharts = null; // Default is null (no theme)
                var themeHighchartsLocation = null;
                var themeCSSFilenames = null;
                var previousThemeLocation = null;

                this.getThemes = function() {
                    return $http.get(restapiService.restapi.themes.THEMES, {
                        cache: DSCacheFactory.get('themeCache')
                    });
                };

                this.getTheme = function(themeId) {
                    return $http.get(restapiService.format(restapiService.restapi.themes.THEMES_BY_ID, themeId), {
                        cache: DSCacheFactory.get('themeCache')
                    });
                };

                this.getThemeCSS = function(themeId) {
                    return $http.get(restapiService.format(restapiService.restapi.themes.THEMES_CSS, themeId), {
                        cache: DSCacheFactory.get('themeCache')
                    });
                };

                this.getThemeHighcharts = function(themeLocation) {
                    if (!themeLocation || themeHighchartsLocation === themeLocation) {
                        return $q.when(themeHighcharts);
                    }
                    else {
                        // ex: themeLocation can be: /addons/hpe/themes/slate
                        return $http.get(themeLocation + '/highcharts/highcharts.json', {
                            cache: DSCacheFactory.get('themeCache')
                        }).then(function(data) {
                            themeHighcharts = data.data;
                            themeHighchartsLocation = themeLocation;
                            return $q.when(themeHighcharts);
                        }).then(null, function(error) {
                            return $q.reject('Cannot get theme Highcharts [' + themeLocation + ']', error);
                        });
                    }
                };

                this.clearCache = function() {
                    if (!logger) {
                        logger = $log.getInstance('themeConfigService');
                    }

                    logger.debug('Clearing cache...');
                    DSCacheFactory.get('themeCache').removeAll();
                };

                /**
                 * Change the current application theme
                 * @param  {String} themeId Theme ID
                 */
                this.changeTheme = function(themeId) {
                    if (!logger) {
                        logger = $log.getInstance('themeConfigService');
                    }

                    var that = this;
                    var deferred = $q.defer();

                    that.getTheme(themeId).then(function(data) {
                        //Update the userTheme / userThemeLocation variable in the $rootScope in order to load the appropriate ressources
                        $rootScope.userTheme = themeId;
                        previousThemeLocation = $rootScope.userThemeLocation;
                        $rootScope.userThemeLocation = data.data.location;
                        if(data.data.options) {
                            $rootScope.userThemeOptions = data.data.options;
                        }
                        $cookies.put('theme', themeId);

                        // get all css files for the theme
                        that.getThemeCSS(themeId).then(function(data) {
                            themeCSSFilenames = data.data;
                        }).then(function(error) {
                            logger.debug('Cannot get CSS theme  [' + themeId + '] ' + error);
                        });

                        // we load the highcharts theme associated
                        that.getThemeHighcharts($rootScope.userThemeLocation).catch(function(error) {
                            logger.warn(error);
                        }).finally(function() {
                            //notify all components in case they need some work themselves
                            $rootScope.$broadcast(events['fafa.themeChanged'], themeId);
                            logger.debug('Broadcasting event [fafa.themeChanged] themeId = ', themeId);
                            deferred.resolve();
                        });
                    }).then(null, function(error) {
                        logger.error('Cannot get theme [' + themeId + '] ' + error);
                        deferred.resolve();
                    });

                    return deferred.promise;
                };

                /**
                 * Apply specific theme CSS
                 * @param  {String} cssFileName CSS file name to apply
                 */
                this.applyThemeCSS = function(cssFileName) {
                    var extension = '.css';
                    if (!logger) {
                        logger = $log.getInstance('themeConfigService');
                    }
                    logger.debug('Function applyThemeCSS called with file:' + cssFileName);

                    // if cssFileName does not contain css extension, add it
                    if (cssFileName.substr(-extension.length).toLowerCase() !== extension) {
                        cssFileName = cssFileName.concat(extension);
                    }
                    var currentCSSLocation = $rootScope.userThemeLocation + CSS_DIRECTORY_PATH;
                    var previousCSSLocation = previousThemeLocation + CSS_DIRECTORY_PATH;

                    var deferred = $q.defer();
                    
                    // cssFileName found in themeCSSFilenames
                    if (Array.isArray(themeCSSFilenames) && _.includes(themeCSSFilenames, cssFileName)) {
                        // when theme has changed
                        if (previousCSSLocation !== currentCSSLocation) {
                            // disable previous CSS from previous theme
                            updateCSSLinkElement(previousCSSLocation + cssFileName, true);
                            // enable CSS for current theme
                            updateCSSLinkElement(currentCSSLocation + cssFileName, false);
                        }
                        // apply css with require (add link element)
                        require(['css!' + currentCSSLocation + cssFileName], function() {
                            logger.debug('Apply theme CSS:' + currentCSSLocation + cssFileName);
                            deferred.resolve();
                        });
                    } else {
                        updateCSSLinkElement(previousCSSLocation + cssFileName, true);
                        deferred.resolve();
                    }
                    return deferred.promise;
                };

                /**
                 * Disable or Enable CSS link element
                 * This function is used when themes are changed dynamically
                 * In case of compatibility issues, applyThemeCSS function should
                 * not call updateCSSLinkElement anymore
                 * 
                 * @param  {String} CSS location + filename
                 * @param  {boolean} disable if true, enable if false
                 */
                var updateCSSLinkElement =  function(cssPath, disable) {
                    // get all HTML link element
                    var links = $("link");
                    // browse all link
                    for (var i = links.length; i >= 0; i--)  {
                        // enable or disable link
                        if (links[i] && links[i].href.indexOf(cssPath) !== -1) {
                            if (disable) {
                                logger.debug('Disable link CSS:' + cssPath);
                            } else {
                                logger.debug('Enable link CSS:' + cssPath);
                            }
                            links[i].disabled = disable;
                        }
                    }
                };
            }
        ]);

        return themeConfigServices;
    }
);