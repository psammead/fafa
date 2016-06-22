'use strict';

var expect = require('chai').expect,
	platformLogger = require('./platform-logger');


describe('Platform Logger Test Suite', function() {

	describe('#log', function() {
		it('in charge of logging the trace message', function() {
			expect(platformLogger).to.respondTo('trace');
		});
		it('in charge of logging the debug message', function() {
			expect(platformLogger).to.respondTo('debug');
		});
		it('in charge of logging the info message', function() {
			expect(platformLogger).to.respondTo('info');
		});
		it('in charge of logging the warning message', function() {
			expect(platformLogger).to.respondTo('warn');
		});
		it('in charge of logging the error message', function() {
			expect(platformLogger).to.respondTo('error');
		});
		it('in charge of logging the fatal message', function() {
			expect(platformLogger).to.respondTo('fatal');
		});
	});
});