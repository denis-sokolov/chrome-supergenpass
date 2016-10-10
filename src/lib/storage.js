/**
* Abstract Chrome synchronized storage away with convenient access functions.
*
* This file globalizes a single name "storage".
* All methods return promises.
*
* Password is an object with the following properties:
*  hash: string
*  len: number
*  method: string "md5" or "sha512"
*  name: string
*  secret: string, usually empty
*
* storage.passwords
*
*   storage.passwords.add(pass)
*     pass here is a Password with a password field instead of a hash field
*     Resolves if succeeds
*
*   storage.passwords.get(Password, domain)
*     domain is a string
*     Resolves to a string of generated password
*
*   storage.passwords.list()
*     Resolves to a list of Password objects
*
*   storage.passwords.remove(Password)
*     Resolves to a list of current passwords
*
*
* storage.hasUserSeen(key)
*   Resolves to a boolean if this is the first time we run with key
*
*
* storage.whitelist
*
*   storage.whitelist.get()
*     Resolves to an array of string
*
*   storage.whitelist.set(array[string])
*     Resolves if succeeds
*/

var i18n = require('./i18n.js');
var hash = require('./hash.js');
var supergenpass = require('supergenpass-lib');

var read = function(name, deflt) {
	return new Promise(function(resolve){
		chrome.storage.sync.get([name], function(result){
			if (chrome.runtime.lastError)
				throw new Error(chrome.runtime.lastError);
			resolve(result[name] || deflt);
		});
	});
};

var write = function(name, value) {
	return new Promise(function(resolve){
		var input = {};
		input[name] = value;
		chrome.storage.sync.set(input, function(){
			if (chrome.runtime.lastError)
				throw new Error(chrome.runtime.lastError);
			resolve();
		});
	});
};

/**
 * Calculate a string hahs that identifies the current object.
 * Useful for comparison of two Passwords.
 */
var passwordSettingsHash = function(pass){
	return Object.keys(pass).map(function(k){
		return pass[k];
	}).join(';');
};

var list = function() {
	return read('passwords', []).then(function(passwords){
		var seen = [];

		// Filter out duplicates
		// chrome.sync can add duplicates among different computers
		return passwords.filter(function(pass){
			var key = passwordSettingsHash(pass);
			if (seen.indexOf(key) < 0) {
				seen.push(key);
				return true;
			}
			return false;
		}).map(function(pass){
			pass.method = pass.method || 'md5';
			pass.secret = pass.secret || '';
			return pass;
		});
	});
};

var addRaw = function(newPasswords){
	return list().then(function(passwords){
		passwords = passwords.concat(newPasswords);
		return write('passwords', passwords).then(list);
	});
};

// This cache requires our background process to be persistent,
// see manifest background/persistent key.
var cache = {};

var api = {
	passwords: {
		add: function(pass) {
			pass.hash = hash(pass.password);
			delete pass.password;
			return addRaw([pass]);
		},
		get: function(pass, domain) {
			var currentHash = passwordSettingsHash(pass);
			if (!cache[currentHash]) {
				var attempt = window.prompt(i18n('unlock_prompt', pass.name));
				for(;;){
					if (!attempt) {
						return Promise.reject(new Error('User did not authenticate'));
					}
					if (hash(attempt) === pass.hash) {
						cache[currentHash] = attempt;
						break;
					}
					attempt = window.prompt(i18n('unlock_prompt_retry', pass.name));
				}
			}
			return Promise.resolve(supergenpass(cache[currentHash], domain, {
				length: pass.len,
				method: pass.method,
				secret: pass.secret
			}));
		},
		list: list,
		remove: function(pass) {
			return list().then(function(passwords){
				var hashToRemove = passwordSettingsHash(pass);
				passwords = passwords.filter(function(p){
					return passwordSettingsHash(p) !== hashToRemove;
				});
				return write('passwords', passwords).then(list);
			});
		}
	},
	hasUserSeen: function(key){
		return read('seen', []).then(function(keys){
			if (keys.indexOf(key) >= 0)
				return true;
			keys.push(key);
			write('seen', keys);
			return false;
		});
	},
	whitelist: {
		get: function() {
			return read('whitelist', []);
		},
		set: function(newValue) {
			return write('whitelist', newValue);
		}
	}
};

// Migrate old settings
if ('settings' in localStorage) {
	var v5 = JSON.parse(localStorage.settings);
	if (v5.passwords && v5.passwords.length) {
		addRaw(
			v5.passwords.map(function(p){
				return {name:p.note, len:p.len, method:'md5', hash:p.hash, secret: ''};
			})
		);
	}

	if (v5.whitelist) {
		api.whitelist.get().then(function(whites){
			whites = whites.concat(v5.whitelist);
			api.whitelist.set(whites);
		});
	}

	delete localStorage.settings;
	return;
}

module.exports = api;
