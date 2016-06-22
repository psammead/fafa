define([
    'angular',
    'components/language-config/language-config-services',
    'components/user-preferences/user-preferences-services'
], function(angular) {
    'use strict';

    var languageSelectorControllers = angular.module('languageSelectorControllers', ['languageConfigServices', 'userPreferencesServices']);

    languageSelectorControllers.controller('languageSelectorController', ['$rootScope', '$scope', '$log', 'languageConfigService', 'userPreferencesService',
        function($rootScope, $scope, $log, languageConfigService, userPreferencesService) {

            var logger = $log.getInstance('languageSelectorController');

            // Available languages List
            var refreshLanguages = function() {
                languageConfigService.getLanguages().then(function(languages) { 
                    $scope.languages = [];
                    languages.data.list.forEach(function(language) {
                        $scope.languages.push(language);
                    });
                }).then(null, function(error) {
                    logger.error('Cannot get list of languages', error);
                });
            };
            refreshLanguages();

            // Get default language
            $scope.userLanguage = $rootScope.userLanguage;

            // Switch language function
            $scope.changeLanguage = function(langKey) {
                if (langKey !== $rootScope.userLanguage) {
                    languageConfigService.changeLanguage(langKey);
                    userPreferencesService.setLanguage(langKey);
                    $scope.userLanguage = langKey;
                }
            };
        }
    ]);
});