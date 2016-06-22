'use strict';

var path = require('path'),
	jwt = require('jsonwebtoken'),
	nconf = require('nconf'),
	passport = require('passport'),
	_ = require('lodash'),
	ms = require('ms'),
	sessionLogger = require(path.join(process.env.ROOT, 'server', 'logger', 'sessions-logger')),
	serverLogger = require(path.join(process.env.ROOT, 'server', 'logger', 'server-logger'));

//Enhance req.user object with saml related information
var populateSAMLInformation = function(req) {
	try {
		var nameID = req.cookies.nameID ? JSON.parse(new Buffer(req.cookies.nameID, 'base64').toString('utf8')) : null;
		if (nameID) {
			if (!req.user) {
				req.user = {};
			}

			req.user.nameID = nameID.nameID;
			req.user.nameIDFormat = nameID.nameIDFormat;
			req.user.sessionIndex = nameID.sessionIndex;
		}
		else {
			serverLogger.error('No nameID cookie');
		}
	}
	catch (e) {
		serverLogger.error('Invalid nameID cookie');
	}
};

//Return user information
exports.loggedin = function(req, res) {
	if (!req.token) {
		res.json({});
	}
	else {
		var jwtOptions = {
			algorithms: [nconf.get('authentication:jwt:algorithm')]
		};

		jwt.verify(req.token, nconf.get('authentication:jwt:secret'), jwtOptions, function(err, decoded) {
			err ? res.json({}) : res.json({user: decoded});
		});
	}
};

//Return the authentication mode (local/saml)
exports.mode = function(req, res) {
	res.send(process.env.AUTH_MODE);
};

//Return the JWT token
exports.token = function(req, res) {
	res.send(req.token);
};

//Re-generate a JWT token
exports.updateToken = function(req, res) {
	if (!req.body.action) {
		res.status(400).end();
	}
	else {
		if (req.body.action === 'refresh') {
			if (!req.user) {
				console.error('Cannot refresh the JWT token: Invalid JWT token');
				serverLogger.error('Cannot refresh the JWT token: Invalid JWT token');
				res.status(400).end();
			}
			else {
				var expiresInMinutes = nconf.get('authentication:jwt:expiresInMinutes');
				var expiresIn = nconf.get('authentication:jwt:expiresIn');
				var options = {};

				if (expiresInMinutes) {
					console.warn('Warning: expiresInMinutes from jwt configuration is deprecated. Please use expiresIn instead');
					serverLogger.warn('Warning: expiresInMinutes from jwt configuration is deprecated. Please use expiresIn instead');
				}

				options.expiresIn = expiresIn ? expiresIn : expiresInMinutes + 'm';
				res.cookie('token', jwt.sign(req.user, nconf.get('authentication:jwt:secret'), options), {httpOnly: true});
				res.status(200).end();
			}
		}
		else {
			res.status(400).end();
		}
	}
};

//Returns session configuration
exports.sessionConfiguration = function(req, res) {
	var sessionConfiguration = nconf.get('authentication:session');

	if (!sessionConfiguration) {
		sessionConfiguration = {sliding: false}; //Default configuration (legacy)
	}

	var sc_it = sessionConfiguration.idleTimeout;
	if (sc_it) {
		sessionConfiguration.idleTimeout = Math.floor(ms(sc_it) / 1000);
	}

	var sc_ri = sessionConfiguration.refreshInterval;
	if (sc_ri) {
		sessionConfiguration.refreshInterval = Math.floor(ms(sc_ri) / 1000);
	}

	res.send(sessionConfiguration);
};

//Local authentication callbacks
exports.local = {
	preLoginCallback: function(req, res, next) {
		passport.authenticate('local', function(err, user) {
			if (err) {
				return next(err);
			}
			else {
				if (!user) {
					res.status(401).send('Unauthorized');
				}
				else if (user.locked_out) {
					res.status(423).send('Locked');
				}
				else {
					req.user = user;
					next();
				}
			}
		})(req, res, next);
	},

	login: function(req, res) {
		sessionLogger.logLogin(req);

		//Filter and unify token informations
		req.user.id = req.user.user_id;
		req.user = _.omit(req.user, ['_id', '_rev', 'user_id', 'password', 'description', 'last_modification']);

		var options = {};

		var expiresInMinutes = nconf.get('authentication:jwt:expiresInMinutes');
		var expiresIn = nconf.get('authentication:jwt:expiresIn');

		if (expiresIn) {
			options.expiresIn = expiresIn;
		}
		else if (expiresInMinutes) {
			console.warn('Warning: expiresInMinutes from jwt configuration is deprecated. Please use expiresIn instead');
			serverLogger.warn('Warning: expiresInMinutes from jwt configuration is deprecated. Please use expiresIn instead');
			options.expiresIn = expiresInMinutes + 'm';
		}

		var token = jwt.sign(req.user, nconf.get('authentication:jwt:secret'), options);
		res.cookie('token', token, {
			httpOnly: true
		});

		res.status(200).end();
	},

	logout: function(req, res) {
		res.clearCookie('token');
		sessionLogger.logLogout(req);
		res.status(200).end();
	}
};

//SAML authentication callbacks
exports.saml = {
	loginCallback: function(req, res) {
		sessionLogger.logLogin(req);

		//Unify token informations
		req.user.id = req.user.nameID;
		req.user.name = req.user.nameID;

		var options = {};
		
		var expiresInMinutes = nconf.get('authentication:jwt:expiresInMinutes');
		var expiresIn = nconf.get('authentication:jwt:expiresIn');

		if (expiresIn) {
			options.expiresIn = expiresIn;
		}
		else if (expiresInMinutes) {
			console.warn('Warning: expiresInMinutes from jwt configuration is deprecated. Please use expiresIn instead');
			serverLogger.warn('Warning: expiresInMinutes from jwt configuration is deprecated. Please use expiresIn instead');
			options.expiresIn = expiresInMinutes + 'm';
		}

		var token = jwt.sign(req.user, nconf.get('authentication:jwt:secret'), options);

		res.cookie('token', token, {
			httpOnly: true
		});

		//Save nameID and nameIDFormat information outside the JWT token
		res.cookie('nameID', new Buffer(JSON.stringify({nameID: req.user.nameID, nameIDFormat: req.user.nameIDFormat, sessionIndex: req.user.sessionIndex}), 'utf8').toString('base64'), {httpOnly: true});
		
		res.redirect('/');
	},

	preLogoutCallback: function(req, res, next) {
		populateSAMLInformation(req);
		next();
	},

	logoutCallback: function(req, res, next) {
		populateSAMLInformation(req);
		res.clearCookie('token');
		res.clearCookie('nameID');
		sessionLogger.logLogout(req);
		next();
	},

	postLogoutCallback: function(req, res) {
		res.redirect('/');
	}
};