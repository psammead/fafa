define([
        'angular',
        'angularTranslate',
        'angularTranslatePartialLoader',
        'angularDynamicLocale',
        'components/language-config/language-config-services'
    ],
    function(angular) {
        'use strict';
        var languageConfigApp = angular.module('languageConfig', ['pascalprecht.translate', 'tmh.dynamicLocale', 'languageConfigServices']);

        languageConfigApp.config(['$translateProvider', 'tmhDynamicLocaleProvider',
            function($translateProvider, tmhDynamicLocaleProvider) {

                // Set language formatting  path template
                tmhDynamicLocaleProvider.localeLocationPattern('/components/language-config/locales/angular-locale_{{locale}}.js');

                // Set language file path template
                $translateProvider.useLoader('$translatePartialLoader', {
                    urlTemplate: '{part}/{lang}.json',
                    loadFailureHandler: 'TranslateErrorHandler'
                });
                // Fallback language
                $translateProvider.fallbackLanguage('en-us');

                // Enable escaping of HTML
                $translateProvider.useSanitizeValueStrategy('escaped');
            }
        ]).factory('TranslateErrorHandler', function($q, $log) {
            return function(part, lang) {
                $log.error('The "' + part + '/' + lang + '" part was not loaded.');
                return $q.when({});
            };
        });

        return languageConfigApp;
    });
