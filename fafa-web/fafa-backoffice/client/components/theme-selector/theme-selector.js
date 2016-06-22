define([
        'angular',
        'components/theme-selector/theme-selector-controllers',
        'components/theme-selector/theme-selector-directives'
    ],
    function(angular) {
        'use strict';
        var themeSelectorApp = angular.module('themeSelector', ['themeSelectorControllers', 'themeSelectorDirectives']);
        return themeSelectorApp;
    });
