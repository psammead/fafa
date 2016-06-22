'use strict';

var expect = require('chai').expect,
	serverLogger = require('./server-logger');


describe('Server Logger Test Suite', function() {

	describe('#log', function() {
		it('in charge of logging the trace message', function() {
			expect(serverLogger).to.respondTo('trace');
		});
		it('in charge of logging the debug message', function() {
			expect(serverLogger).to.respondTo('debug');
		});
		it('in charge of logging the info message', function() {
			expect(serverLogger).to.respondTo('info');
		});
		it('in charge of logging the warning message', function() {
			expect(serverLogger).to.respondTo('warn');
		});
		it('in charge of logging the error message', function() {
			expect(serverLogger).to.respondTo('error');
		});
		it('in charge of logging the fatal message', function() {
			expect(serverLogger).to.respondTo('fatal');
		});
	});
});