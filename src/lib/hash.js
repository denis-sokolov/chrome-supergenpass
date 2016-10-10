var supergenpass = require('supergenpass-lib');

module.exports = function(text){
	return new Promise(function(resolve){
		return supergenpass.generate(text, 'chromegenpass-chrome-extension', {
			length: 16
		}, resolve);
	});
};
