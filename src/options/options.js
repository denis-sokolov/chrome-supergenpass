var storage = require('../lib/storage.js');
var i18n = require('../lib/i18n.js');
var $ = require('jquery');

$(function(){
	'use strict';

	// Navigation
	var nav = $('.main-nav ul');
	$('.tab').each(function(){
		var id = $(this).prop('id');
		var li = $('<li>');
		li.append($('<a>').prop('href', '#'+id).attr('data-msg', 'options_'+id+'_nav'));
		nav.append(li);
	});

	i18n.page($);

	// Passwords
	var password_section = $('.password-list');
	var passwords = $('.passwords');
	var updateNames = function(passes){
		passwords.empty();
		passes.forEach(function(pass){
			var extras = [];
			if (pass.len !== 10) {
				extras.push(i18n('options_passwords_list_len', pass.len));
			}
			if (pass.method !== 'md5') {
				extras.push(pass.method);
			}
			if (pass.secret) {
				extras.push(i18n('options_passwords_list_secret'));
			}

			var text = pass.name;
			if (extras.length)
				text += ' ('+extras.join(i18n('options_passwords_list_extras_separator'))+')';

			$('<li>').data('pass', pass)
				.text(text).appendTo(passwords);
		});
		if (passes.length) {
			password_section.show();
		}
	};
	var update = function(){
		password_section.hide();
		storage.passwords.list().then(updateNames);
	};
	update();
	passwords.on('click', 'li', function(){
		var el = $(this);
		storage.passwords.remove(el.data('pass')).then(updateNames);
	});
	// Add
	(function(){
		var form = $('.add');
		var els = {
			password: form.find('[name="password"]'),
			confirm: form.find('[name="confirm"]'),
			len: form.find('[name="length"]'),
			methods: form.find('[name="method"]'),
			note: form.find('[name="note"]'),
			secret: form.find('[name="secret"]')
		};

		var error = (function(){
			var list = form.find('.errors');
			var api = function(msg){
				var el = $('<li>').text(msg);
				el.appendTo(list);
				setTimeout(function(){
					el.addClass('old');
				}, 5000);
			};
			api.clean = function(){
				list.empty();
			};
			return api;
		})();

		form.on('submit', function(e){
			e.preventDefault();

			error.clean();

			var password = els.password.val(),
				confirm = els.confirm.val(),
				len = parseInt(els.len.val(), 10),
				method = els.methods.filter(':checked').val(),
				note = els.note.val(),
				secret = els.secret.val();

			if (password !== confirm) {
				return error(i18n('options_passwords_add_password_match'));
			}

			storage.passwords.add({
				len: len,
				method: method,
				name: note,
				password: password,
				secret: secret
			}).then(updateNames);
		});
	})();



	// Whitelist
	var whitelist = $('[name="whitelist"]').prop('disabled', true);
	var whitelist_store = function(){
		storage.whitelist.set(whitelist.val().split('\n').map(function(d){return d.trim();}));
	};
	storage.whitelist.get().then(function(whitelists){
		whitelist.val(whitelists.join('\n')).prop('disabled', false);
	});
	whitelist.on('change', whitelist_store);
	$(window).on('unload', whitelist_store);



	// Initial tab
	if (!document.location.hash) {
		document.location.hash = '#passwords';
	}

	$(window).on('hashchange', function(){
		$('a').removeClass('current');
		$('a[href="'+document.location.hash+'"]').addClass('current');
	}).trigger('hashchange');
});
