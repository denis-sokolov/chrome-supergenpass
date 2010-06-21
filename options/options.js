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

// This should be global
passwords = [];

$(document).ready(function(){
	{ // Functions
		var msg = function(text){
			var li = $('<li/>').text(text);
			$('#status').prepend(li);
			setTimeout(function(){
				li.fadeOut('slow');
			}, 2000);
		}


		// Careful, the same settings are written in html/background.html
		// Change both. Will break all existing user settings!
		var hash = function(text){
			return supergenpass(text, 'chromegenpass-chrome-extension', 16);
		}

		var inputvalue = function(name, type){
			var value = $('form [name="'+name+'"]').val();
			if (type) value = parseInt(value);
			return value;
		}
	}

	function addItemHTML(p, i)
	{
		if (typeof p['len'] == 'undefined')
			console.error('Password',p,'has len undefined!');
		else
		{
			li.clone().removeClass('new').attr('name', i)
				.find('.note').text(p['note']).end()
				.find('.length').text(p['len']).end()
				.appendTo('#settings');
		}
	}

	// Load options
	passwords = load();
	var li = $('#settings .new');
	for (i in passwords)
		addItemHTML(passwords[i], i);

	// Adding new items
	var form = $('form');
	form.submit(function(e){
		e.preventDefault();
		var password = inputvalue('password');
		var confirm = inputvalue('confirm');
		var len = inputvalue('length', 'int');
		var note = inputvalue('note');
		if (password == ''){
			msg('Password cannot be empty.');
		}
		else if (password != confirm){
			msg('Passwords do not match.');
		}
		else if (!(len > 0)){
			msg('Length parameter is wrong. If you don\'t know, type 10.');
		}
		else {
			var p = {
				'note': note,
				'hash': hash(password),
				'len': len,
			}
			passwords.push(p);
			addItemHTML(p, passwords.length);
			save(passwords);
			chrome.extension.sendRequest({'passwords': passwords});
		}
	});


	// Delete
	$('#settings').delegate('li', 'click', function(e){
		e.preventDefault();
		var li = $(this);
		passwords.splice(i, 1);
		// Margin animated, because on .remove margins collapse instantly.
		li.animate({'width':'0','margin-left':'-'+li.css('margin-right')}, 'slow', function(){
			li.remove();
		});
		save(passwords);
		chrome.extension.sendRequest({'passwords': passwords});
	});
});
