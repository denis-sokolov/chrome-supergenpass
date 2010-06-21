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

CONFIRM_KEYCODES = [81, 113]; // Q, q

var passwords = [];
// Do not activate on chrome-extension pages and other,
// because the result might not be what we expect.
if (['http:','https:'].indexOf(document.location.protocol) > -1)
{
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
			var supergenpass = null;
			eval(response['supergenpass']);
			window.jQuery = jQuery
			Popup = PopupFactory();
		
			// Get data
			passwords = response['passwords'];
		
			// Main work
			jQuery('input[type="password"]').live('focus', function(e){
				var me = $(this);
				if (me.val() == '')
					Popup.instructions(me, passwords);
			});
			jQuery('input[type="password"]').live('blur', function(e){
				if (Popup.state() != 'updated-to')
					Popup.hide('fast');
			});
			jQuery('input[type="password"]').live('keyup', function(e){
				var me = $(this);
				var value = me.val();
				var confirm_key = passwords.length > 9;
				if (value == '')
					Popup.instructions(me, passwords);	
				else
				{
					// Hide only if the popup is with instruction
					// Hide only if entered text cannot be understood as a password number
					if (Popup.state() == 'instructions' && (!confirm_key || !Number(value)))
						Popup.hide('fast');

					if ( 
						   // If there are more than 10 passwords and the key is CONFIRM_KEY
						   ( confirm_key && CONFIRM_KEYCODES.indexOf(e.keyCode) > -1)
						   // OR there are less than 10 passwords and this is a number key
						|| (!confirm_key && e.keyCode > 48 && e.keyCode < 59)
					)
					{
						if (confirm_key) // Remove confirm key
							value = value.substr(0, value.length - 1)
						var entered = parseInt(value);
						// If the string is incorrect, it will parse to NaN, which is
						// neither bigger nor small than any other number
						if (entered > 0 && entered <= passwords.length)
						{
							// 0-based array are cool 8)
							// 1-based people are not :)
							var index = entered - 1;
							var password = passwords[index];
							if ('password' in password)
							{ 
								var hash = supergenpass(password['password'], document.location.host, password['len']);
								insert_password(me, hash, password['note']);
							}
							else
							{
								chrome.extension.sendRequest({ 'password': index }, function(response) {
									passwords = response['passwords'];
									var hash = supergenpass(passwords[index]['password'], document.location.host, password['len']);								
									insert_password(me, hash, password['note']);
								});
							}
						} // end of correct input
					} // end of if e.keyCode in [0..9qQ]
				} // end of value is not empty
			}); // end keypress live
		}); // answer to send Request
	} // init()


	function PopupFactory()
	{
		var el = $('<div/>').css({
			'cursor': 'default',
			'position': 'absolute',
			'opacity': '0',
			'background-color': 'rgba(0,0,0,0.7)',
			'color': 'white',
			'padding': '5px 10px',
			'border-radius': '6px'
		});
		el.appendTo('body');
		var my_state = null;
		var on_state_change = null;
		var hide_timeout = null;
	
		var hide = function(speed)
		{
			if (speed)
				el.animate({ 'opacity': 0 }, speed, function(){ my_state = null; el.hide(); })
			else
			{
				el.hide().css('opacity', 0);
				my_state = null;
			}
			return this;
		}
	
		el.click(function(){
			hide('fast');
		});
	
		return {
			'hide': hide,
			'hide_in': function(timeout, speed)
			{
				hide_timeout = setTimeout(function(){
					Popup.hide(speed);
				}, 3000);	
			},
			'instructions': function(field, passwords)
			{
				this
					.hide().stop()
					.state('instructions')
					.text(passwords)
					.move(field).show('fast');
			},
			'move': function(field)
			{
				offset = field.offset();
				el.css({
					'left': offset.left,
					'top': offset.top + field.height() + 5, // 5 for padding
				});
				return this;
			},
			'show': function(speed)
			{
				if (speed)
					el.show().animate({ 'opacity': 1 }, speed)
				else
					el.show().css('opacity', 1);
				return this;
			},
			'state': function (state, callback)
			{
				if (arguments.length == 0)
					return my_state;
				my_state = state;
				if (on_state_change)
					on_state_change(state);
				clearTimeout(hide_timeout);
				if (callback)
					on_state_change = callback;
				return this;
			},
			'stop': function ()
			{
				el.stop(true, true);
				clearTimeout(hide_timeout);
				return this;
			},
			'text': function (txt)
			{
				if (typeof txt == 'object')
				{
					if (txt.length == 0)
					{
						url = chrome.extension.getURL('options/options.html');
						html = '<em>ChromeGenPass</em><br>';
						html += 'You have no passwords saved.<br>';
						html += 'Add passwords on the ';
						html += '<a href="'+url+'" style="color:white" target="_blank">options page</a>.';
						el.html(html);
					}
					else
					{ // Passwords
						var html = '<ol style="list-style-type:none;padding:0;margin:0">';
						var confirm_key = passwords.length > 9 ? 'q' : '';
						for (i in passwords)
							html += '<li>' + (Number(i) + Number(1)) + confirm_key + ': ' + passwords[i]['note'];
						html += '</ol>';
						el.html(html)
					}
				}
				else
				{
					el.text(txt);	
				}
				return this;
			},
		}
	}

	function insert_password(field, password, note)
	{
		field
			.val(password)
			.data('bgcolor', field.css('background-color'))
			.data('color', field.css('color'))
			.css({
				'background-color': '#DAFFB3',
				'color': 'black'
			});

		Popup.hide().stop().state('updated-to').move(field).text('Updated to ' + note).show('slow').hide_in(3000, 'slow');

		// Revert if entry has been changed
		var test = setInterval(function(){
			if (field.val() != password)
			{
				field.css({
					'background-color': field.data('bgcolor'),
					'color': field.data('color')
				});
				Popup.hide('fast');
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
}