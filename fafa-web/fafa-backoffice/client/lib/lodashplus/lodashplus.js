define('lodashplus', [
	'lodash',
	'lodashDeep'
], function(_, _s, ld) {
	'use strict';
	_.mixin(ld);
	return _;
});