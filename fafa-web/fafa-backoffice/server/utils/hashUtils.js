'use strict';

var crypto = require('crypto');

var SALT_SIZE = 64,
	ITERATION_COUNT = 10000, 	//pbkdf2 iteration count (recommanded size)
	KEY_SIZE = 64, 				//pbkdf2 key size (recommanded size)
	KEY_ENCODING = 'hex';


/**
 * Generate a cryptographically strong pseudo-random data for salting
 * @param  {Function} 	callback
 */
var genSalt = function(callback) {
	crypto.randomBytes(SALT_SIZE, function(err, buf) {
		if (err) {
			callback(err);
		} else {
			callback(null, buf);
		}
	});
};

/**
 * Applies a pseudo random function HMAC-SHA1 to derive a key from the given
 * password and salt
 * @param  {String}   password
 * @param  {Buffer}   salt
 * @param  {Function} callback
 */
var hashWithPbkdf2 = function(password, salt, callback) {
	var bufferedPassword = new Buffer(password);

	crypto.pbkdf2(bufferedPassword, salt, ITERATION_COUNT, KEY_SIZE, function(err, hash) {
		if (err) {
			callback(err);
		} else {
			callback(null, Buffer.concat([salt, hash]));
		}
	});
};

/**
 * Generate a password hash using the PBKDF2 algorithm
 * @param  {String}   password
 * @param  {Function} callback
 */
var genHash = function(password, callback) {
	genSalt(function(err, salt) {
		if (err) {
			callback(err);
		} else {
			hashWithPbkdf2(password, salt, function(err, hash) {
				if (err) {
					callback(err);
				} else {
					callback(null, hash.toString(KEY_ENCODING));
				}
			});
		}
	});
};

/**
 * Returns if a password match a given hash
 * @param  {String} 	password
 * @param  {String} 	hash
 * @param  {Function} 	callback
 * @return {Boolean}    true if the password match, false otherwise
 */
var verifyHash = function(password, hash, callback) {
	var salt = new Buffer(hash, KEY_ENCODING).slice(0, SALT_SIZE);

	hashWithPbkdf2(password, salt, function(err, _hash) {
		if (err) {
			callback(err);
		} else {
			callback(null, _hash.toString(KEY_ENCODING) === hash);
		}
	});
};

module.exports = {
	genHash: genHash,
	verifyHash: verifyHash
};