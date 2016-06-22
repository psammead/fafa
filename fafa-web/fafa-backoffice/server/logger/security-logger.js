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
var logger = log4js.getLogger('security-logger');

exports.formatLog = function (req, msg, type) {
	var logResult = null;

		//check if there is a specific user or if the global server is requesting the object 
	 if (req !== null && req.user) {
	 	var user = req.user.id || req.user.nameID;
	 	if(req.user.tenant_id) {
	 		logResult = 'User: '+user + ' (tenant:'+req.user.tenant_id+') (' + req.connection.remoteAddress + ') : '+type+' : '+ msg;
	 	} else {
	 		logResult = 'User: '+user + ' (' + req.connection.remoteAddress + ') : '+type+' : '+ msg;
	 	}
	 } else {
	 	logResult = '(Node Server) : '+ type+' : '+ msg;
	 }
	 return logResult;
};

// keep separate log per objects in case we want to pre-defined different format per object
exports.logWorkspace = function (req, msg) {
	logger.info(this.formatLog(req,msg,'WORKSPACE'));
};

exports.logView = function (req, msg) {
	logger.info(this.formatLog(req,msg,'VIEW'));
};

exports.logWidget = function (req, msg ) {
	logger.info(this.formatLog(req,msg,'WIDGET'));
};

exports.logPlugin = function (req, msg ) {
	logger.info(this.formatLog(req,msg,'PLUGIN'));
};

exports.logLayout = function (req, msg) {
	logger.info(this.formatLog(req,msg,'LAYOUT'));
};

exports.logCategory = function (req, msg ) {
	logger.info(this.formatLog(req,msg,'CATEGORY'));
};

exports.logOperation = function (req, msg) {
	logger.info(this.formatLog(req,msg,'OPERATION'));
};

exports.logLaunch = function (req, msg) {
	logger.info(this.formatLog(req,msg,'LAUNCH'));
};

exports.logLaunchCategory = function (req, msg) {
	logger.info(this.formatLog(req,msg,'LAUNCH_CATEGORY'));
};

exports.logMenuBar = function(req, msg) {
	logger.info(this.formatLog(req,msg,'MENU_BAR'));
};

exports.logMenuItem = function(req, msg) {
	logger.info(this.formatLog(req,msg,'MENU_ITEM'));
};

exports.logTheme = function (req, msg) {
	logger.info(this.formatLog(req,msg,'THEME'));
};

exports.logModule = function (req, msg) {
	logger.info(this.formatLog(req,msg,'MODULE'));
};

exports.logUserPreference = function (req, msg) {
	logger.info(this.formatLog(req,msg,'USER_PREFERENCE'));
};

exports.logLaunchKeyword = function (req, msg) {
	logger.info(this.formatLog(req,msg,'LAUNCH_KEYWORD'));
};

exports.logUser = function(req, msg) {
	logger.info(this.formatLog(req, msg, 'USER'));
};

exports.logRole = function(req, msg) {
	logger.info(this.formatLog(req, msg, 'ROLE'));
};

exports.logLanguage = function(req, msg) {
	logger.info(this.formatLog(req, msg, 'LANGUAGE'));
};

exports.logger = logger;