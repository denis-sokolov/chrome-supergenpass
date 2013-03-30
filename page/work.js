/*!
SuperGenPass for Google Chrome™ by Denis
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

function work(selector){
	chrome.extension.sendRequest({ 'init': true }, function(response) {
	if (!('passwords' in response)) {
		return;
	}

	// Globalize jQuery
	eval(response.jquery);

	var Popup = CreatePopup();

	// Data
	passwords = response.passwords;

	// Main work
	jQuery('body')
		.on('focus', selector, function(e){
			var me = $(this);
			if (me.val() === '')
				Popup.instructions(me, passwords);
		})
		.on('blur', selector, function(e){
			if (Popup.state() !== 'updated-to')
				Popup.hide('fast');
		})
		.on('keyup', selector, function(e){
			var me = $(this);
			var value = me.val();

			var needsConfirm = passwords.length > 9;
			if (!value)
				Popup.instructions(me, passwords);
			else
			{
				// Hide only if the popup is with instruction
				// Hide only if entered text cannot be understood as a password number
				if (Popup.state() == 'instructions' && (!needsConfirm || !Number(value)))
					Popup.hide('fast');

				/*
					In certain layouts, there are different characters on number keys.
					If a user has a wrong layout and presses 1, he does not see a 1, but a bullet.
					He then waits for SuperGenPass for Google Chrome™ by Denis to do its bidding, but the extension
					never sees a 1, it sees a strange character.

					So this checks for this scenario.
					Any non-alphanumeric might mean that the layout is wrong.

					Moreover, in case everything is normal, we hide the popup both
					after a delay and on any subsequent keypress.
				*/
				if (value.length == 1 &&
					'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890 '.indexOf(value) < 0)
					Popup.layout(me);
				else if (value.length > 1 && Popup.state() == 'layout')
					Popup.hide('fast');
				else if (
					// OR there are less than 10 passwords and this is a number key
					(!needsConfirm && e.keyCode > 48 && e.keyCode < 59) ||
					// If there are more than 10 passwords and the key is CONFIRM_KEY
					(needsConfirm && CONFIRM_KEYCODES.indexOf(e.keyCode) > -1)
				)
				{
					if (needsConfirm) // Remove confirm key
						value = value.substr(0, value.length - 1);
					if ('123456789'.indexOf(value.substr(0, 1)) >= 0) {
						var entered = parseInt(value, 10);
						// If the string is incorrect, it will parse to NaN, which is
						// neither bigger nor small than any other number
						if (entered > 0 && entered <= passwords.length)
						{
							var index = entered - 1;
							var password = passwords[index];
							chrome.extension.sendRequest({ password: index }, function(response) {
								if ('hash' in response)
									insert_password(Popup, me, response.hash, password.note);
								else
									me.val('');
							});
						} // end of correct input
					}
				} // end of if e.keyCode in [0..9qQ]
			} // end of value is not empty
		}); // end keypress live
	// Skipped indent
	}); // answer to send Request
} // init()

function insert_password(Popup, field, password, note)
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
