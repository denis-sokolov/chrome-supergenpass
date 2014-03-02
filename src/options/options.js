(function($,storage){
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

		// i18n
		$('[data-msg]').each(function(){
			var el = $(this);
			el.text(chrome.i18n.getMessage(el.data('msg')) || ('[' + el.data('msg') + ']'));
		});




		// Passwords
		var password_section = $('.password-list');
		var passwords = $('.passwords');
		var updateNames = function(passes){
			passwords.empty();
			passes.forEach(function(pass){
				$('<li>').text(pass.name+' ('+pass.len+')').appendTo(passwords);
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
			storage.passwords.remove(el.prevAll('li').length).then(updateNames);
		});
		// Add
		(function(){
			var form = $('.add');
			var els = {
				password: form.find('[name="password"]'),
				confirm: form.find('[name="confirm"]'),
				len: form.find('[name="length"]'),
				note: form.find('[name="note"]')
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
					note = els.note.val();

				if (password !== confirm) {
					return error('Passwords do not match.');
				}

				storage.passwords.add(note, len, password).then(updateNames);
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
})(jQuery, storage);
