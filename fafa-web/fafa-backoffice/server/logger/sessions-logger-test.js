'use strict';

var expect = require('chai').expect,
	sessionsLogger = require('./sessions-logger');


describe('Sessions Logger Test Suite', function() {

	describe('#formatLogin', function() {
		it('in charge of formatting the login message (with no user)', function() {
			var req = {};
			var res = sessionsLogger.formatLogin(req);
			expect(res).to.be.equal(null);	// no message to log
		});		
		it('in charge of formatting the login message (with user.user_id)', function() {
			var req = {
        		user: {	user_id: "monkey" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = sessionsLogger.formatLogin(req);
			expect(res).to.match(/monkey has logged in \(localhost\)$/);
		});
		it('in charge of formatting the login message (with user.nameID)', function() {
			var req = {
        		user: {	nameID: "monkey" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = sessionsLogger.formatLogin(req);
			expect(res).to.match(/monkey has logged in \(localhost\)$/);
		});		
	});

	describe('#formatLogout', function() {
		it('in charge of formatting the logout message (with no user)', function() {
			var req = {};
			var res = sessionsLogger.formatLogout(req);
			expect(res).to.be.equal(null);	// no message to log
		});		
		it('in charge of formatting the logout message (with user.id)', function() {
			var req = {
        		user: {	id: "monkey" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = sessionsLogger.formatLogout(req);
			expect(res).to.match(/monkey has logged out \(localhost\)$/);
		});
		it('in charge of formatting the logout message (with user.nameID)', function() {
			var req = {
        		user: {	nameID: "monkey" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = sessionsLogger.formatLogout(req);
			expect(res).to.match(/monkey has logged out \(localhost\)$/);
		});		
	});

	describe('#logLogin', function() {
		it('in charge of logging the login message', function() {
			expect(sessionsLogger).to.respondTo('logLogin');
		});
	});

	describe('#logLogout', function() {
		it('in charge of logout the logout message', function() {
			expect(sessionsLogger).to.respondTo('logLogout');
		});
	});


});