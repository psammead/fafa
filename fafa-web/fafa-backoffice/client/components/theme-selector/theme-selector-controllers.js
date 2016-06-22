define([
        'angular',
        'components/theme-config/theme-config',
        'components/user-preferences/user-preferences-services'
    ],
    function(angular) {
        'use strict';

        var themeSelectorControllers = angular.module('themeSelectorControllers', ['themeConfig', 'userPreferencesServices']);

        themeSelectorControllers.controller('themeSelectorController', ['$rootScope', '$scope', '$log', 'themeConfigService', 'userPreferencesService',
            function($rootScope, $scope, $log, themeConfigService, userPreferencesService) {
                var logger = $log.getInstance('themeSelectorController');

                // Switch theme function
                $scope.changeTheme = function(themeId) {
                    if (themeId !== $rootScope.userTheme) {
                        userPreferencesService.setTheme(themeId);
                        themeConfigService.changeTheme(themeId);
                    }
                };

                // Available themes List
                this.initTheme = function() {
                    themeConfigService.getThemes().then(function(data) {
                        $scope.themes = data.data;
                    }).then(null, function(error) {
                        logger.error('Cannot get themes list', error);
                    });
                };

                // Get the list of available themes
                this.initTheme();
            }
        ]);
    }
);