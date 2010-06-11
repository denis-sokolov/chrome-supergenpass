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
		jQuery('input[type="password"]').live('keyup', function(e){
			if (e.keyCode > 48 && e.keyCode < 59)
			{
				var me = $(this);
				if (passwords.length < 10)
				{
					var entered = parseInt(me.val());
					if (entered > 0 && entered <= passwords.length)
					{
						var index = entered - 1;
						var password = passwords[index];
						if ('password' in password)
						{ 
							insert_password(me, info, passwords[index]);
						}
						else
						{
							chrome.extension.sendRequest({ 'password': index }, function(response) {
								passwords = response['passwords'];
								insert_password(me, info, passwords[index]);
							});
						}
					} // end of correct input
				}
				else
				{
					alert('You have more than 10 passwords stored.\nAt this moment we are yet to implement the way to work with them.\nI am sorry.');
				}
			} // end of if e.keyCode in [0..9]
		}); // end keypress live
	}); // answer to send Request
} // init()


function insert_password(field, info, password)
{
	if (!('password' in password))
		return false;
		
	field
		.val(password['password'])
		.data('bgcolor', field.css('background-color'))
		.data('color', field.css('color'))
		.css({
			'background-color': '#DAFFB3',
			'color': 'black'
		});

	// Info box
	offset = field.offset();
	info.css({
		'opacity': 0, // Hide in case it was showing old info
		'left': offset.left,
		'top': offset.top + field.height() + 5, // 5 for padding
	});
	info.text('Updated to ' + password['note'])
		.animate({'opacity': 0.8}, 'slow');
	setTimeout(function(){
		info.animate({'opacity': 0}, 'slow');
	}, 3000);

	// Revert if entry has been changed
	var test = setInterval(function(){
		if (field.val() != password['password'])
		{
			field.css({
				'background-color': field.data('bgcolor'),
				'color': field.data('color')
			});
			info.animate({'opacity': 0}, 'fast');
			clearInterval(test);
		}
	}, 200);
}


// Update passwords on request
chrome.extension.onRequest.addListener(function(req, sender, sendResponse){
	if ('passwords' in req)
		passwords = req['passwords'];
	sendResponse({});
});