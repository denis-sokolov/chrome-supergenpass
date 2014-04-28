hash = function(text){
	return supergenpass(text, 'chromegenpass-chrome-extension', {
		length: 16
	});
};
