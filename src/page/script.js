jQuery(function($){
	if ($('div.'+chrome.i18n.getMessage('uustring')).length) {
		return;
	}

	var popup = (function(){
		var positionAt = function(popup, el) {
			var offset = el.offset();
			popup.css({ left: offset.left, top: offset.top + el.height() + 8 });
			popup.show();
			return this;
		};

		// We store the passwords on the popup, so that if the passwords have
		// been modified while the popup is up, we still use the password
		// we displayed to the user.
		var passwords = [];

		// This is the active popup that the user is focused on, as opposed
		// to multiple possible floating status popups.
		var main = $('<div>').addClass(chrome.i18n.getMessage('uustring')).hide().appendTo('body');
		main.on('mousedown', 'a', function(){
			// Workaround for popup disappearing when the user click on it
			document.location = $(this).prop('href');
		});

		var api = {
			hide: function() { main.hide(); },
			to: function(el) { positionAt(main, el); }
		};

		api.getPassword = function(index) {
			return new Promise(function(resolve){
				if (!passwords[index-1]) throw new Error('No index '+index);
				resolve(passwords[index-1]);
			});
		};

		api.instructions = function(el) {
			chrome.runtime.sendMessage('passwords', function(passes){
				passwords = passes;
				main.empty();
				if (passes.length) {
					passes.forEach(function(pass, i){
						return $('<div>').text((i+1).toString() + ' ' + pass.name).appendTo(main);
					});
				} else {
					main.append('<p>No passwords saved for SuperGenPass.</p>');
					var url = chrome.extension.getURL('src/options/options.html');
					main.append('<p>Add passwords in <a href="'+url+'">the options</a>.</p>');
				}
				api.to(el);
			});
		};

		return api;
	})();


	$('body').on('focus', 'input[type="password"]', function(){
		popup.instructions($(this));
	}).on('blur', 'input[type="password"]', function(){
		popup.hide();
	}).on('keyup', 'input[type="password"]', function(e){
		// If the user has escaped (27) or used space key (32) to cancel
		// the auth dialog, we want to avoid triggering that auth window again.
		if (e.which < 40) {
			return;
		}

		var el = $(this);
		var value = el.val();

		if (!value) return popup.instructions(el);
		if (value.length === 1) {
			if (!Number(value)) return popup.hide();
			popup.getPassword(Number(value)).then(function(password){
				chrome.runtime.sendMessage(['password', password, document.location.hostname], function(result){
					// If result is empty (failed), we want to blank the input
					// to remove the digit the user has entered
					el.val(result);

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
				});
			});
		}
	});

	// We initialized on the first focus event,
	// thus we missed the original focus
	$(':focus').trigger('focus');
});
