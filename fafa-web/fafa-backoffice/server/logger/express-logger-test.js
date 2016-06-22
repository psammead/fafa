'use strict';

var expect = require('chai').expect,
	expressLogger = require('./express-logger');


describe('Express Logger Test Suite', function() {

	describe('#Connect Logger', function() {
		it('in charge of logging the http request received by express', function() {
			expect(expressLogger).to.be.a('function');
		});
	});
});