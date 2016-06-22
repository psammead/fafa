/**
 * Authentication module
 */
define([
	'angular',
	'components/language-config/language-config',
	'components/authentication/authentication-controllers',
	'components/authentication/authentication-services'
],
function(angular) {
	'use strict';
	var authenticationApp = angular.module('authentication', [
		'authenticationControllers',
		'authenticationServices',
		'pascalprecht.translate'
	]);
	authenticationApp.run(['$translatePartialLoader', function($translatePartialLoader) {
		// Load module translation data
		$translatePartialLoader.addPart('/components/authentication');
	}]);
	return authenticationApp;
});