jQuery(function($){
	if ($('div.'+i18n('uustring')).length) {
		return;
	}

	var popup = (function(){
		var positionAt = function(popup, el) {
			var offset = el.offset();
			popup.css({ left: offset.left, top: offset.top + el.height() + 8 })
				.show();
		};

		// We store the passwords on the popup, so that if the passwords have
		// been modified while the popup is up, we still use the password
		// we displayed to the user.
		var passwords = [];

		// This is the active popup that the user is focused on, as opposed
		// to multiple possible floating status popups.
		var main = $('<div>').addClass(i18n('uustring')).hide().appendTo('body');
		main.on('mousedown', 'a', function(){
			// Workaround for popup disappearing when the user click on it
			document.location = $(this).prop('href');
		});

		var api = {};

		// Hides the popup
		api.hide = function() { main.hide(); };

		// Returns the password object displayed in the popup at the index
		api.getPassword = function(index) {
			return new Promise(function(resolve){
				if (!passwords[index-1]) throw new Error('No index '+index);
				resolve(passwords[index-1]);
			});
		};

		// Presents a list of password instructions at the element el
		api.instructions = function(el) {
			chrome.runtime.sendMessage('passwords', function(passes){
				passwords = passes;
				main.empty();
				if (passes.length) {
					passes.forEach(function(pass, i){
						return $('<div>').text((i+1).toString() + ' ' + pass.name).appendTo(main);
					});
				} else {
					main.append($('<p>').text(i18n('nopasswords')));
					var url = chrome.extension.getURL('src/options/options.html');
					main.append(
						i18n.html($('<p>'), 'nopasswords_link', ['<a href="'+url+'">', '</a>'])
					);
				}
				positionAt(main, el);
			});
		};

		return api;
	})();

	var handleFieldValue = function(el){
		var value = el.val();

		if (!value) return popup.instructions(el);
		if (value.length !== 1) return;
		if (!Number(value)) return popup.hide();

		popup.getPassword(Number(value)).then(function(password){
			chrome.runtime.sendMessage(['password', password, document.location.hostname], function(result){
				if (result.success) {
					el.val(result.generated);

					// Some JavaScript frameworks store the value of the field
					// internally and disregard the actual value when the form
					// is submit. This is a similar problem to browser
					// autocomplete not modifying state of such frameworks:
					// https://github.com/angular/angular.js/issues/1460
					//
					// .trigger('change') does not work probably because
					// Chrome separates extensions and scripts on the page
					// I did expect .trigger to trigger a native event, though.
					el.get(0).dispatchEvent(new window.Event('change'));
				} else {
					// Blank the input to remove the digit the user has entered
					el.val('');
				}
			});
		});
	};

	// :password is case insensitive, while type="password" is
	$('body').on('focus', 'input:password', function(){
		popup.instructions($(this));
	}).on('blur', 'input:password', function(){
		popup.hide();
	}).on('keyup', 'input:password', function(e){
		// If the user has escaped (27) or used space key (32) to cancel
		// the auth dialog, we want to avoid triggering that auth window again.
		if (e.which < 40) {
			return;
		}

		handleFieldValue($(this));
	});

	// We initialized on the first focus event,
	// thus we missed the original focus and due to the race condition
	// maybe even the first keyup
	(function(){
		var current = $(':focus');
		popup.instructions(current);
		handleFieldValue(current);
	})();
});
