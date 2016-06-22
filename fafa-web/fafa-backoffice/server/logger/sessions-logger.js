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
var logger = log4js.getLogger('sessions-logger');

exports.formatLogin = function (req) {
	var logResult = null;	// default unexpected message
		//check if there is a specific user or if the global server is requesting the object 
	 if (req !== null && req.user) {
	 	var user = req.user.user_id || req.user.nameID;
	 	if(req.user.tenant_id) {
		 	logResult = user + ' (tenant:'+req.user.tenant_id+') has logged in (' + req.connection.remoteAddress + ')';
	 	} else {
		 	logResult = user + ' has logged in (' + req.connection.remoteAddress + ')';
	 	}
	 }
	 return logResult;
};

exports.formatLogout = function (req) {
	var logResult = null;	// default unexpected message
		//check if there is a specific user or if the global server is requesting the object 
	 if (req !== null && req.user) {
	 	var user = req.user.id || req.user.nameID;
	 	if(req.user.tenant_id) {
		 	logResult = user + ' (tenant:'+req.user.tenant_id+') has logged out (' + req.connection.remoteAddress + ')';
	 	} else {
		 	logResult = user + ' has logged out (' + req.connection.remoteAddress + ')';
	 	}
	 }
	 return logResult;
};

exports.logLogin = function (req) {
	var logMsg = this.formatLogin(req);
	if (logMsg !== null) {
		logger.info(logMsg);			
	} 
};

exports.logLogout = function (req) {
	var logMsg = this.formatLogout(req);
	if (logMsg !== null) {
		logger.info(logMsg);			
	} 
};

module.exports.logger = logger;