var i18n = require('../lib/i18n.js');
var $ = require('jquery');
var popup = require('./popup.js')($, i18n('uustring'));

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

var runonceperdom = function(f) {
	$(function(){
		var c = i18n('uustring')+'-added';
		var body = $('body');
		if (body.hasClass(c)) {
			return;
		}
		body.addClass(c);
		f();
	});
};

runonceperdom(function(){
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
	var current = $(':focus');
	popup.instructions(current);
	handleFieldValue(current);
});
