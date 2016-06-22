/**
 * Log enhancer function
 */
'use strict';
define([], function() {
	// returns a logging function, to override the logginFunction given as paramenter
	// it will log local time and the context (e.g. file name)
	var getContextualLoggingFunction = function(loggingFunction, context) {
		return function() {
            var args = [].slice.call(arguments);
            // prepend timestamp and context
            args[0] = ['[', new Date().toLocaleString(), '][', context, '] ', args[0]].join('');
            // call the original $log.debug function with the new output
            loggingFunction.apply(null, args);
		};
    };

    var getLoggingFunction = function(loggingFunction) {
		return function() {
            var args = [].slice.call(arguments);
            // prepend timestamp 
            args[0] = ['[', new Date().toLocaleString(), '] ', args[0]].join('');
            // call the original $log.debug function with the new output
            loggingFunction.apply(null, args);
		};
    };

	return function($log) {
		// original angular's $log functions
		var log = $log.log,
			info = $log.info,
			warn = $log.warn,
			debug = $log.debug,
			error = $log.error;

		$log.log = getLoggingFunction(log);
		$log.info = getLoggingFunction(info);
		$log.warn = getLoggingFunction(warn);
		$log.debug = getLoggingFunction(debug);
		$log.error = getLoggingFunction(error);

		$log.disableDebug = function() {
			$log.debug = function(){};
			$log.getInstance = function(context) {
				return {
					log: getContextualLoggingFunction(log, context),
					info: getContextualLoggingFunction(info, context),
					warn: getContextualLoggingFunction(warn, context),
					debug: $log.debug,
					error: getContextualLoggingFunction(error, context)
				};
			};
		};

		$log.getInstance = function(context) {
			return {
				log: getContextualLoggingFunction(log, context),
				info: getContextualLoggingFunction(info, context),
				warn: getContextualLoggingFunction(warn, context),
				debug: getContextualLoggingFunction(debug, context),
				error: getContextualLoggingFunction(error, context)
			};
		};

        return $log;
	};
});
