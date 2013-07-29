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
$(document).ready(function(){
	'use strict';
	/*global chrome:false,storage:false,supergenpass:false*/

	// Careful, the same settings are written in html/background.html
	// Change both. Will break all existing user settings!
	var hash = function(text){
		return supergenpass(text, 'chromegenpass-chrome-extension', 16);
	};

	var add = (function(){
		var li = $('.current .new'),
			list = $('.current ol');
		return function(p){
			li.clone().removeClass('new')
				.find('.note').text(p.note).end()
				.find('.length').text(p.len).end()
				.appendTo(list);
		};
	})();

	var passwords = storage.passwords();

	passwords.forEach(add);

	// Adding new items
	(function(){
		var form = $('.add form'),
			el = {
				password: form.find('[name="password"]'),
				confirm: form.find('[name="confirm"]'),
				len: form.find('[name="length"]'),
				note: form.find('[name="note"]')
			};

		var msg = function(text){
			var li = $('<li/>').text(text);
			$('.status').prepend(li);
			setTimeout(function(){
				li.fadeOut('slow');
			}, 2000);
		};

		form.submit(function(e){
			e.preventDefault();

			var password = el.password.val(),
				confirm = el.confirm.val(),
				len = parseInt(el.len.val(), 10),
				note = el.note.val();

			if (!password) {
				return msg('Password cannot be empty.');
			}
			if (password !== confirm) {
				return msg('Passwords do not match.');
			}
			if (len <= 0 || isNaN(len)) {
				return msg('Length parameter is wrong. Popular value is 10.');
			}
			if (len < 3) {
				return msg('Length cannot be smaller than 3, because of SuperGenPass bug. And why would you need a password this short anyway?');
			}
			if (len > 24) {
				return msg('SuperGenPass does not generate passwords longer than 24 symbols. I do not know why.');
			}

			var p = {
				'note': note,
				'hash': hash(password),
				'len': len
			};
			$('.current').prop('open', true);
			passwords.push(p);
			add(p, passwords.length);
			storage.passwords(passwords);
			chrome.extension.sendRequest({'settings': storage()});
		});
	})();

	// Delete
	$('.current').on('click', 'li', function(e){
		e.preventDefault();
		var li = $(this);
		passwords.splice(li.prevAll('li').length-1, 1);
		li.remove();
		storage.passwords(passwords);
		chrome.extension.sendRequest({'settings': storage()});
	});

	// Show help on first run
	if (!passwords.length) {
		$('.current').prop('open', false);
		$('.instructions').prop('open', true);
	}

	// Whitelist
	(function(){
		$('.whitelist textarea')
			.val(storage.whitelist().join('\n'))
			.change(function(){
				storage.whitelist(this.value.split('\n').map(function(domain){
					return domain.trim();
				}).filter(function(domain){
					return domain && domain !== '';
				}));
				chrome.extension.sendRequest({'settings': storage()});
			});
	})();
});
