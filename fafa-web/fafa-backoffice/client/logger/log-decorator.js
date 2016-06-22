/**
 * Log Decorator module
 */
'use strict';
define([
	'/logger/log-enhancer.js'
],
function(enhanceLogger) {
	return ['$provide', function($provide) {
		$provide.decorator('$log',  ['$delegate', function($delegate) {
			enhanceLogger($delegate);
			return $delegate;
		}]);
	}];
});