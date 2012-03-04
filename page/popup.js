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

var CreatePopup = function() {
	var el = $('<div/>').css({
		'cursor': 'default',
		'position': 'absolute',
		'opacity': '0',
		'background-color': 'rgba(0,0,0,0.7)',
		'color': 'white',
		'padding': '5px 10px',
		'border-radius': '6px',
		'z-index': '10000'
	});
	el.appendTo('body');
	var my_state = null;
	var on_state_change = null;
	var hide_timeout = null;

	var hide = function(speed)
	{
		if (speed)
			el.animate({ 'opacity': 0 }, speed, function(){ my_state = null; el.hide(); });
		else
		{
			el.hide().css('opacity', 0);
			my_state = null;
		}
		return this;
	};

	el.click(function(){
		hide('fast');
	});

	return {
		hide: hide,
		hide_in: function(timeout, speed)
		{
			var p = this;
			hide_timeout = setTimeout(function(){
				p.hide(speed);
			}, 3000);
		},
		instructions: function(field, passwords)
		{
			this
				.hide().stop()
				.state('instructions')
				.text(passwords)
				.move(field).show('fast');
		},
		layout: function(field)
		{
			this
				.hide().stop()
				.state('layout')
				.text('Make sure that you have the correct layout turned on.')
				.move(field).show('fast');
			this.hide_in(1500, 'slow');
		},
		move: function(field)
		{
			offset = field.offset();
			el.css({
				'left': offset.left,
				'top': offset.top + field.height() + 5 // 5 for padding
			});
			return this;
		},
		show: function(speed)
		{
			if (speed)
				el.show().animate({ 'opacity': 1 }, speed);
			else
				el.show().css('opacity', 1);
			return this;
		},
		state: function (state, callback)
		{
			if (!arguments.length)
				return my_state;
			my_state = state;
			if (on_state_change)
				on_state_change(state);
			clearTimeout(hide_timeout);
			if (callback)
				on_state_change = callback;
			return this;
		},
		stop: function ()
		{
			el.stop(true, true);
			clearTimeout(hide_timeout);
			return this;
		},
		text: function (txt)
		{
			if (typeof txt == 'object')
			{
				if (!txt.length)
				{
					url = chrome.extension.getURL('options/options.html');
					html = '<em>SuperGenPass for Google Chrome™ by Denis</em><br>';
					html += 'You have no passwords saved.<br>';
					html += 'Add passwords on the ';
					html += '<a href="'+url+'#settings" style="color:white" target="_blank">options page</a>.';
					el.html(html);
				}
				else
				{ // Passwords
					var html = '<ol style="list-style-type:none;padding:0;margin:0">';
					var confirm_key = passwords.length > 9 ? 'q' : '';
					for (var i in passwords)
						html += '<li>' + (Number(i) + Number(1)) + confirm_key + ': ' + passwords[i]['note'];
					html += '</ol>';
					el.html(html);
				}
			}
			else
			{
				el.text(txt);
			}
			return this;
		}
	};
};