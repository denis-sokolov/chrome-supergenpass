/**
 * Abstract i18n functions.
 *
 * This file globalizes a single name "i18n".
 *
 * i18n(message_code, [...args])
 *   Returns a text value for message_code and args
 *
 *   i18n.html(element, message_code, htmls)
 *     Fills the element with a text value for message_code, with %n replaced
 *     by raw html snippets from htmls, returns the element
 *
 *   i18n.page(jQuery)
 *     Runs using jQuery on a page and populates all data-*-msg values.
 *     Use data-msg=key, data-value-msg, and data-placeholder-msg.
 */
(function(global){
	'use strict';

	var msg = function(name){
		var args = Array.prototype.slice.call(arguments);
		args.shift();
		return chrome.i18n.getMessage.call(chrome.i18n, name, args) || ('[' + name + ']');
	};

	var html = function(el, key, htmls){
		htmls = htmls || [];

		var m = el.text(msg(key)).html();

		// Reverse is requires to replace %10 before %1
		// Although we replace only a single entry,
		// it can be reordered in a messages file.
		htmls.map(function(html, index){
			return {
				index: index + 1,
				html: html.trim()
			};
		}).forEach(function(r){
			m = m.replace('%'+r.index, r.html);
		});

		return el.html(m);
	};


	var api = msg;

	api.html = html;

	api.page = function($){
		$('[data-msg]').each(function(){
			var el = $(this);
			var args = el.data('msg').split(';');
			var key = args.shift();
			html(el, key, args);
		});
		$('[data-value-msg]').each(function(){
			var el = $(this);
			el.val(msg(el.data('value-msg')));
		});
		$('[data-placeholder-msg]').each(function(){
			var el = $(this);
			el.prop('placeholder', msg(el.data('placeholder-msg')));
		});
	};

	global.i18n = api;
})(this);
