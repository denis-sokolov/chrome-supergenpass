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

chrome.extension.sendRequest({ 'init': true }, function(response) {
	eval(response['jquery']);
	window.jQuery = jQuery;
	passwords = response['passwords'];

	var $domain = $('#domain');
	var $pass = $('#pass');
	var $length = $('#length');
	var $result = $('#result');

	$('body').on('change', 'input', function(){
		var pass = $pass.val();
		var domain = $domain.val();
		var length = $length.val();
		if (!pass || !domain) return;
		if (!length || length < 3) return;
		$result.val(supergenpass(pass, domain, length));
	});
	$pass.add($domain).add($length).on('keyup', function(){
		$(this).trigger('change');
	});

	$('.predef').on('click', 'button', function(){
		var me = $(this);
		me.closest('p').find('input').val(me.val()).change();
	});

	// Prefill domain field
	chrome.tabs.getSelected(null, function(tab) {
		var hostNameFinder = new RegExp('//([^\/]+)/');
		$domain.val(hostNameFinder.exec(tab.url)[1]);
	});
});
