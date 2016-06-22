define([
    'angular',
    'components/theme-selector/theme-selector-controllers',
    'css!components/theme-selector/theme-selector.css'

  ],
  function (angular) {
    'use strict';

    return angular.module('themeSelectorDirectives', ['themeSelectorControllers'])
      .directive('hpeThemeSelector', function () {
        return {
          restrict: 'E',
          replace: true,
          controller: 'themeSelectorController',
          templateUrl: '/components/theme-selector/theme-selector.html',
          scope: {}
        };
      });
  });
