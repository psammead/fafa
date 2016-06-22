/*
	Authentication routes
 */

'use strict';

var path = require('path'),
	passport = require('passport'),
	authentication = require(path.join(process.env.ROOT, 'server', 'authentication', 'authentication'));

var isLocalMode = process.env.AUTH_MODE === 'local';

module.exports = function(app) {
	//Route for retrieving user informations (i.e. name, roles ...)
	app.get('/auth/loggedin', authentication.loggedin);

	//Route for retrieving the authentication mode (i.e local or saml)
	app.get('/auth/mode', authentication.mode);

	//Route for retrieving the authentication token client-side
	app.get('/auth/token', authentication.token);

	//Route for updating the JWT token
	app.post('/auth/token', authentication.updateToken);

	//Route for getting session informations
	app.get('/auth/session/configuration', authentication.sessionConfiguration);

	if (isLocalMode) {
		//Login route
		app.post('/auth/local/login', authentication.local.preLoginCallback, authentication.local.login);

		//Logout route
		app.post('/auth/local/logout', authentication.local.logout);
		
	} else {
		//Login route, idp rediection
		app.get('/auth/saml/login', passport.authenticate('saml', {session: false}));

		//Login callback route
		app.post('/auth/saml/callback', passport.authenticate('saml', {session: false}), authentication.saml.loginCallback);

		//Logout, idp redirection
		app.get('/auth/saml/logout', authentication.saml.preLogoutCallback, passport.authenticate('saml', {session: false, samlFallback: 'logout-request'}));

		//Callback route (SP/IDP initiated SLO)
		app.post('/', authentication.saml.logoutCallback, passport.authenticate('saml', {session: false}), authentication.saml.postLogoutCallback);
	}
};