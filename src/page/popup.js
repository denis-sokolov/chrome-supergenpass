var i18n = require('../lib/i18n.js');

module.exports = function($, name) {
	var positionAt = function(popup, el) {
		var offset = el.offset();
		popup.css({ left: offset.left, top: offset.top + el.height() + 8 })
			.show();
	};

	// We store the passwords on the popup, so that if the passwords have
	// been modified while the popup is up, we still use the password
	// we displayed to the user.
	var passwords = [];

	// This is the active popup that the user is focused on, as opposed
	// to multiple possible floating status popups.
	var main = $('<div>').addClass(name).hide();
	$(function(){ main.appendTo('body'); });

	main.on('mousedown', 'a', function(){
		// Workaround for popup disappearing when the user click on it
		document.location = $(this).prop('href');
	});

	var api = {};

	// Hides the popup
	api.hide = function() { main.hide(); };

	// Returns the password object displayed in the popup at the index
	api.getPassword = function(index) {
		return new Promise(function(resolve){
			if (!passwords[index-1]) throw new Error('No index '+index);
			resolve(passwords[index-1]);
		});
	};

	// Presents a list of password instructions at the element el
	api.instructions = function(el) {
		chrome.runtime.sendMessage('passwords', function(passes){
			passwords = passes;
			main.empty();
			if (passes.length) {
				passes.forEach(function(pass, i){
					return $('<div>').text((i+1).toString() + ' ' + pass.name).appendTo(main);
				});
			} else {
				main.append($('<p>').text(i18n('nopasswords')));
				var url = chrome.extension.getURL('src/options/options.html');
				main.append(
					i18n.html($('<p>'), 'nopasswords_link', ['<a href="'+url+'">', '</a>'])
				);
			}
			positionAt(main, el);
		});
	};

	return api;
};
