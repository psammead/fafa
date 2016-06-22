define([
        'angular',
        'components/language-selector/language-selector-controllers',
        'components/language-selector/language-selector-directives'
    ],
    function(angular) {
        'use strict';
        var languageSelectorApp = angular.module('languageSelector', ['languageSelectorControllers', 'languageSelectorDirectives']);
        return languageSelectorApp;
    });
