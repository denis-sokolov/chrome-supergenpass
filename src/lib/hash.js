var supergenpass = require('supergenpass-lib');

module.exports = function(text){
	return supergenpass(text, 'chromegenpass-chrome-extension', {
		length: 16
	});
};
