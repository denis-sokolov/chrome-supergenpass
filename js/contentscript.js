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
			if (value == '')
				Popup.instructions(me, passwords);	
			else
			{
				if (Popup.state() != 'updated-to' && (e.keyCode < 49 || e.keyCode > 58))
					Popup.hide('fast');
				else
				{
					if (passwords.length < 10)
					{
						var entered = parseInt(value);
						if (entered > 0 && entered <= passwords.length)
						{
							var index = entered - 1;
							var password = passwords[index];
							if ('password' in password)
							{ 
								insert_password(me, passwords[index]);
							}
							else
							{
								chrome.extension.sendRequest({ 'password': index }, function(response) {
									passwords = response['passwords'];
									insert_password(me, passwords[index]);
								});
							}
						} // end of correct input
					}
					else
					{
						alert('You have more than 10 passwords stored.\nAt this moment we are yet to implement the way to work with them.\nI am sorry.');
					}
				} // end of if e.keyCode in [0..9]
			} // end of value is not empty
		}); // end keypress live
	}); // answer to send Request
} // init()


function PopupFactory()
{
	var el = $('<div/>').css({
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
	
	return {
		'hide': function(speed)
		{
			if (speed)
				el.animate({ 'opacity': 0 }, speed, function(){ my_state = null; })
			else
			{
				el.css('opacity', 0);
				my_state = null;
			}
			return this;
		},
		'hide_in': function(timeout, speed)
		{
			hide_timeout = setTimeout(function(){
				Popup.hide(speed);
			}, 3000);	
		},
		'instructions': function(field, passwords)
		{
			this
				.state('instructions')
				.hide().stop()
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
				el.animate({ 'opacity': 1 }, speed)
			else
				el.css('opacity', 1);
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
			if (typeof txt == 'object' && 'note' in txt[0])
			{ // Passwords
				var html = '<ol style="list-style-type:none;padding:0;margin:0">';
				for (i in passwords)
					html += '<li>' + (Number(i) + Number(1)) + ': ' + passwords[i]['note'];
				
				html += '</ol>';
				el.html(html)
			}
			else
			{
				el.text(txt);	
			}
			return this;
		},
	}
}

function insert_password(field, password)
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

	Popup.hide().stop().state('updated-to').move(field).text('Updated to ' + password['note']).show('slow').hide_in(3000, 'slow');

	// Revert if entry has been changed
	var test = setInterval(function(){
		if (field.val() != password['password'])
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