/**
 * Abstract Chrome synchronized storage away with convenient access functions.
 *
 * This file globalizes a single name "storage".
 * All methods return promises.
 *
 * storage.passwords
 *
 *   storage.passwords.add(name, len, password)
 *     Resolves if succeeds
 *
 *   storage.passwords.get(pass, domain)
 *     pass here is an object with name, hash and len properties
 *     domain is a string
 *     Resolves to a string of generated password
 *
 *   storage.passwords.list()
 *     Resolves to a list of {name, len, hash} objects
 *
 *   storage.passwords.remove(pass)
 *     pass here is an object with name, hash and len properties
 *     Resolves to a list of current passwords
 *
 *
 * storage.unseen(key)
 *   Resolves if this is the first time we run with key
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
(function(global){
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


	var addRaw = function(newPasswords){
		return list().then(function(passwords){
			passwords = passwords.concat(newPasswords);
			return write('passwords', passwords).then(list);
		});
	};
	var list = function() {
		return read('passwords', []).then(function(passwords){
			var seen = [];

			// Filter out duplicates
			// chrome.sync can add duplicates among different computers
			return passwords.filter(function(pass){
				var key = pass.name + ';' + pass.len + ';' + pass.hash;
				if (seen.indexOf(key) < 0) {
					seen.push(key);
					return true;
				}
				return false;
			});
		});
	};

	// This cache requires our background process to be persistent,
	// see manifest background/persistent key.
	var cache = {};

	global.storage = {
		passwords: {
			add: function(name, len, password) {
				return addRaw([{name:name, len:len, hash:hash(password)}]);
			},
			get: function(pass, domain) {
				if (!cache[pass.name]) {
					var attempt = window.prompt(chrome.i18n.getMessage('unlock_prompt', pass.name));
					while(true){
						if (!attempt) {
							return Promise.reject(new Error('User did not authenticate'));
						}
						if (hash(attempt) === pass.hash) {
							cache[pass.name] = attempt;
							break;
						}
						attempt = window.prompt(chrome.i18n.getMessage('unlock_prompt_retry', pass.name));
					}
				}
				return Promise.resolve(supergenpass(cache[pass.name], domain, {
					length: pass.len
				}));
			},
			list: list,
			remove: function(pass) {
				return list().then(function(passwords){
					passwords = passwords.filter(function(p){
						return JSON.stringify(p) !== JSON.stringify(pass);
					});
					return write('passwords', passwords).then(list);
				});
			}
		},
		unseen: function(key){
			return new Promise(function(resolve, reject){
				read('seen', []).then(function(keys){
					if (keys.indexOf(key) < 0) {
						keys.push(key);
						write('seen', keys);
						resolve();
					} else {
						reject();
					}
				});
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
					return {name:p.note, len:p.len, hash:p.hash};
				})
			);
		}

		if (v5.whitelist) {
			global.storage.whitelist.get().then(function(whites){
				whites = whites.concat(v5.whitelist);
				global.storage.whitelist.set(whites);
			});
		}

		delete localStorage.settings;
		return;
	}
})(this);
