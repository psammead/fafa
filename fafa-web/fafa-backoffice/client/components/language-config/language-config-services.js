'use strict';

define([
    'angular',
    'angularTranslate',
    'angularDynamicLocale',
    'commons/restapi/commons-restapi',
    'angularCookies'
], function(angular) {

    var languageConfigServices = angular.module('languageConfigServices', ['pascalprecht.translate', 'tmh.dynamicLocale', 'commonsRestapi', 'ngCookies']);

    languageConfigServices.service('languageConfigService', ['$rootScope', '$q', '$log', '$translate', '$translatePartialLoader', '$http', 'tmhDynamicLocale', 'restapiService', '$cookies',
        function($rootScope, $q, $log, $translate, $translatePartialLoader, $http, tmhDynamicLocale, restapiService, $cookies) {

            var logger = $log.getInstance('languageConfigService');

            this.changeLanguage = function(language) {
                $rootScope.userLanguage = language;
                $translate.use(language);
                tmhDynamicLocale.set(language);
                $cookies.put('userLanguage', language);
            };

            // remove parts from translatePartialLoader to optimize L10n
            // and add only l10n part which contain all translations
            this.optimizeL10n = function(l10nParts) {
                // browse all parts
                if (Array.isArray(l10nParts)) {
                    l10nParts.forEach(function(part) {
                        // remove parts that should not be loaded
                        $translatePartialLoader.deletePart(part);
                        logger.debug('optimizeL10n - remove part:' + part);
                        $translatePartialLoader.deletePart(part.substr(1));
                        logger.debug('optimizeL10n - remove part:' + part.substr(1));
                    });
                    // add global translation files that contain all translations
                    $translatePartialLoader.addPart("/l10n");
                }
            };

            this.getLanguages = function() {
                return $http.get(restapiService.restapi.languages.LANGUAGES);
            };

            this.getLanguageById = function(languageId) {
                return $http.get(restapiService.restapi.languages.LANGUAGE_BY_ID, languageId);
            };
        }
    ]);
});
