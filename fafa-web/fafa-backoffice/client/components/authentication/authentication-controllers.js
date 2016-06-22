/**
 * Authentication controllers
 */
define([
    'angular',
    'commons/events/commons-events',
    'components/authentication/authentication-services',
    'components/user-preferences/user-preferences-services',
    'components/theme-config/theme-config-services'
], function(angular) {
    'use strict';
    var authenticationControllers = angular.module('authenticationControllers', ['authenticationServices', 'userPreferencesServices', 'themeConfigServices', 'commonsEvents']);

    authenticationControllers.controller('authenticationController', ['$scope', '$rootScope', 'authenticationService', 'userPreferencesService', 'themeConfigService', 'events',
        function($scope, $rootScope, authenticationService, userPreferencesService, themeConfigService, events) {
            //Form inputs
            $scope.user = {};

            $scope.title = userPreferencesService.getTitle();
            $scope.version = userPreferencesService.getVersion(); // null means no badge visible

            $scope.style = {};
            $scope.error;

            themeConfigService.applyThemeCSS('authentication');

            $scope.connect = function(user) {
                authenticationService.login(user).then(function() {
                    authenticationService.handleLogin();
                }, function(err) {
                    $scope.error = err.status;
                });
            };

            $scope.$on(events['fafa.themeChanged'], function() {
                updateStyle();
            });

            var updateStyle = function() {
                if ($rootScope.userThemeLocation && $rootScope.userTheme) {
                    var backgroundSrc = $rootScope.userThemeLocation + '/images/wallpapers/wallpaper.png';
                    $scope.style = {
                        'background-image': 'url(' + backgroundSrc + ')'
                    };
                }
            };

            updateStyle();
        }
    ]);

    return authenticationControllers;
});