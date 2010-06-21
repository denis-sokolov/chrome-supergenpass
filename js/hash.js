if (typeof supergenpass == 'undefined')
	console.error('You have included hash.js before supergenpass.js. Big mistake.')
else if (typeof supergenpass == 'string')
	console.error('Make sure that supergenpass in hash.js comes as a function.')

hash = function(text){
	return supergenpass(text, 'chromegenpass-chrome-extension', 16);
}