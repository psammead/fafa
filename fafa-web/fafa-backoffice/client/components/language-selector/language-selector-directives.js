define([
    'angular',
    'components/language-selector/language-selector-controllers',
    'css!components/language-selector/language-selector.css'

  ],
  function (angular) {
    'use strict';

    return angular.module('languageSelectorDirectives', ['languageSelectorControllers'])
      .directive('hpeLanguageSelector', function () {
        return {
          restrict: 'EA',
          replace: true,
          controller: 'languageSelectorController',
          templateUrl: '/components/language-selector/language-selector.html',
          scope: {}
        };
      });
  });
