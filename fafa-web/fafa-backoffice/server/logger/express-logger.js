'use strict';

// Load log4js module
var log4js = require('log4js');

// Applies logger configuration . Adds log level information dynamically
var configureLogger = function() {
	var conf = require(process.env.ROOT + '/server/public/conf/log4js.json');

	if (conf && !conf.levels) {
		var appenders = conf.appenders;

		if (Array.isArray(conf.appenders)) {
			var levels = {};
			
			appenders.forEach(function(appender) {
				if (appender.category && appender.level) {
					levels[appender.category] = appender.level;
				}
			});

			conf.levels = levels;
			log4js.configure(conf);
		}
	}
};

configureLogger();

// Logger instance
var logger = log4js.getLogger('express-logger');

// http logger to connect express middleware
var httpLogger = log4js.connectLogger(logger, { level: 'auto' });

module.exports = httpLogger;
