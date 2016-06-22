'use strict';

var expect = require('chai').expect,
	securityLogger = require('./security-logger');


describe('Security Logger Test Suite', function() {

	describe('#formatLog', function() {
		it('in charge of formatting the log message (with no user)', function() {
			var req = {};
			var res = securityLogger.formatLog(req, 'my msg', 'OBJECT');
			expect(res).to.match(/\(Node Server\) : OBJECT : my msg$/);
		});		
		it('in charge of formatting the log message (with user.id)', function() {
			var req = {
        		user: {	id: "monkey" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'OBJECT');
			expect(res).to.match(/User: monkey \(localhost\) : OBJECT : my msg$/);
		});
		it('in charge of formatting the log message (with user.nameID)', function() {
			var req = {
        		user: {	nameID: "monkey" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'OBJECT');
			expect(res).to.match(/User: monkey \(localhost\) : OBJECT : my msg$/);
		});		
	});

	describe('#logWorkspace', function() {
		it('should log a security audit for object Workspace ', function() {
			var req = {
        		user: {	id: "monkey" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'WORKSPACE');
			expect(res).to.match(/User: monkey \(localhost\) : WORKSPACE : my msg$/);
		});
	});
	describe('#logView', function() {
		it('should log a security audit for object View ', function() {
			var req = {
        		user: {	id: "admin" },
				connection: { remoteAddress:"127.0.0.1" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'VIEW');
			expect(res).to.match(/User: admin \(127.0.0.1\) : VIEW : my msg$/);
		});
	});
	describe('#logWidget', function() {
		it('should log a security audit for object Widget ', function() {
			var req = {
        		user: {	id: "designer" },
				connection: { remoteAddress:"127.0.0.1" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'WIDGET');
			expect(res).to.match(/User: designer \(127.0.0.1\) : WIDGET : my msg$/);
		});
	});
	describe('#logPlugin', function() {
		it('should log a security audit for object Plugin ', function() {
			var req = {
        		user: {	id: "Martin" },
				connection: { remoteAddress:"martin.emea.hp.com" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'PLUGIN');
			expect(res).to.match(/User: Martin \(martin.emea.hp.com\) : PLUGIN : my msg$/);
		});
	});
	describe('#logLayout', function() {
		it('should log a security audit for object Layout ', function() {
			var req = {
        		user: {	id: "oper_l1" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'LAYOUT');
			expect(res).to.match(/User: oper_l1 \(localhost\) : LAYOUT : my msg$/);
		});
	});
	describe('#logCategory', function() {
		it('should log a security audit for object Category ', function() {
			var req = {
        		user: {	id: "john" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'CATEGORY');
			expect(res).to.match(/User: john \(localhost\) : CATEGORY : my msg$/);
		});
	});	
	describe('#logLaunchCategory', function() {
		it('should log a security audit for object Launch Category ', function() {
			var req = {
        		user: {	id: "john" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'LAUNCH_CATEGORY');
			expect(res).to.match(/User: john \(localhost\) : LAUNCH_CATEGORY : my msg$/);
		});
	});		
	describe('#logOperation', function() {
		it('should log a security audit for all end user executed operations', function() {
			var req = {
        		user: {	id: "john" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'OPERATION');
			expect(res).to.match(/User: john \(localhost\) : OPERATION : my msg$/);
		});
	});	
	describe('#logLaunch', function() {
		it('should log a security audit for all end user launched applications', function() {
			var req = {
        		user: {	id: "john" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'LAUNCH');
			expect(res).to.match(/User: john \(localhost\) : LAUNCH : my msg$/);
		});
	});	
	describe('#logTheme', function() {
		it('should log a security audit for object Theme ', function() {
			var req = {
        		user: {	id: "oper_l1" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'THEME');
			expect(res).to.match(/User: oper_l1 \(localhost\) : THEME : my msg$/);
		});
	});
	describe('#logMenuBar', function() {
		it('should log a security audit for object MenuBar ', function() {
			var req = {
        		user: {	id: "oper_l1" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'MENU_BAR');
			expect(res).to.match(/User: oper_l1 \(localhost\) : MENU_BAR : my msg$/);
		});
	});
	describe('#logMenuItem', function() {
		it('should log a security audit for object MenuItem ', function() {
			var req = {
        		user: {	id: "oper_l1" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'MENU_ITEM');
			expect(res).to.match(/User: oper_l1 \(localhost\) : MENU_ITEM : my msg$/);
		});
	});
	describe('#logUser', function() {
		it('should log a security audit for object User ', function() {
			var req = {
        		user: {	id: "oper_l1" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'USER');
			expect(res).to.match(/User: oper_l1 \(localhost\) : USER : my msg$/);
		});
	});
	describe('#logRole', function() {
		it('should log a security audit for object Role ', function() {
			var req = {
        		user: {	id: "oper_l1" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'ROLE');
			expect(res).to.match(/User: oper_l1 \(localhost\) : ROLE : my msg$/);
		});
	});
	describe('#logUserPreference', function() {
		it('should log a security audit for object User Preference ', function() {
			var req = {
        		user: {	id: "oper_l1" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'USER_PREFERENCE');
			expect(res).to.match(/User: oper_l1 \(localhost\) : USER_PREFERENCE : my msg$/);
		});
	});
	describe('#logLaunchKeyword', function() {
		it('should log a security audit for object LaunchKeyword ', function() {
			var req = {
        		user: {	id: "oper_l1" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'LAUNCH_KEYWORD');
			expect(res).to.match(/User: oper_l1 \(localhost\) : LAUNCH_KEYWORD : my msg$/);
		});
	});
	describe('#logModule', function() {
		it('should log a security audit for object module ', function() {
			var req = {
        		user: {	id: "oper_l1" },
				connection: { remoteAddress:"localhost" }
    		};
			var res = securityLogger.formatLog(req, 'my msg', 'MODULE');
			expect(res).to.match(/User: oper_l1 \(localhost\) : MODULE : my msg$/);
		});
	});

});