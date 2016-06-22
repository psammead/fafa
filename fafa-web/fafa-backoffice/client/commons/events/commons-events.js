/**
 * Events Constants
 */
'use strict';

define([
	'angular'
],
	   function(angular) {

	// Naming convention:
	// namespace.[component].object+Verb
	// where namespace is 'webgui' for the common framework and avoid conflict with 'customer' event code
	//       component is a prefix to isolate events related a a specific ocmponent (ex: dimensionFilter) 
	//       object is the data impacted
	//       verb qualify the operation (ex: Selected, Change, Changed, ...)
	//
	// same id and string to exchange to simplify the understanding.

	var events = {
		// identifier to use : string to exchange at runtime (should be the same)

		'fafa.themeChanged': 'fafa.themeChanged',
		'fafa.userLoggedIn': 'fafa.userLoggedIn',
		'fafa.userLoggedOut': 'fafa.userLoggedOut',
	};

	return angular.module('commonsEvents', []).constant('events', events);
});