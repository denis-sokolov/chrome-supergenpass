/*!
ChromeGenPass = Google Chrome + SuperGenPass love.
Copyright (C) 2010 Denis Sokolov http://sokolov.cc

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
 * All styles are in here not because I don't like separation, but because
 * I don't want to pollute DOM with extra classes.
 * Though that way would be clener and I'd prefer it in any other case,
 * I'd like to be as stealthy as possible.
 */

var passwords = [];

if (/type=['"]?password/.test(document.body.innerHTML))
{ // If password fields are present, prepare for work
	init();
}
else
{ // If no password fields are at the moment, they may appear later
	var catchNewFields = function(e) {
		if (e.target.type == 'password')
		{
			init();
			document.removeEventListener('keypress', catchNewFields);
		}
	}
	document.addEventListener('keypress', catchNewFields, false);
}

function init(){
	chrome.extension.sendRequest({ 'init': true }, function(response) {
		// Get libraries
		eval(response['jquery']);
		eval(response['supergenpass']);
		window.jQuery = jQuery
		
		// Get data
		passwords = response['passwords'];
		
		// To avoid constant hashing, we will hash the entered text only after a certain timeout.
		// This way if a user types fast, only the last keypress will trigger an intensive work.
		// Pattern: bouncer
		var timer = false;
		
		// Prepare the popup
		var info = $('<div/>').css({
			'position': 'absolute',
			'opacity': '0',
			'background-color': 'black',
			'color': 'white',
			'padding': '5px 10px',
			'border-radius': '6px'
		});
		info.appendTo('body');

		// Main work
		jQuery('input[type="password"]').live('keypress', function(e){
			// Do NOT jQueryify this here, because this will be redundant work
			var field = this;
			
			if (timer) clearTimeout(timer);
			timer = setTimeout(function(){
				var me = $(field);
				
				// Text a user has entered
				var entered = me.val();

				// This is our local hash to check if the password is correct.
				// Note that settings ("domain" and length) are also saved in options.js
				// It would be nice to refactor this and put them out in a separate file
				var localHash = supergenpass(entered, 'chromegenpass-chrome-extension', 16);

				for (i in passwords)
				{
					var item = passwords[i];
					if (localHash == item['hash'])
					{
						// The real password for this domain
						var password = supergenpass(entered, location.hostname, item['len']);

						// Field
						me
							.val(password)
							.data('bgcolor', me.css('background-color'))
							.data('color', me.css('color'))
							.css({
								'background-color': '#DAFFB3',
								'color': 'black'
							});

						// Info box
						offset = me.offset();
						info.css({
							'opacity': 0, // Hide in case it was showing old info
							'left': offset.left,
							'top': offset.top + me.height() + 5, // 5 for padding
						});
						info.text('Updated to ' + item['note'])
							.animate({'opacity': 0.8}, 'slow');
						setTimeout(function(){
							info.animate({'opacity': 0}, 'slow');
						}, 3000);
						
						// Revert if entry has been changed
						var test = setInterval(function(){
							if (me.val() != password)
							{
								me.css({
									'background-color': me.data('bgcolor'),
									'color': me.data('color')
								});
								info.animate({'opacity': 0}, 'fast');
								clearInterval(test);
							}
						}, 200);
					}
				}
			}, 100);
		});
	});
}

// Update passwords on request
chrome.extension.onRequest.addListener(function(req, sender, sendResponse){
	if ('passwords' in req)
		passwords = req['passwords'];
	sendResponse({});
});