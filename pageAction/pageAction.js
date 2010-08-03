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

chrome.extension.sendRequest({ 'init': true }, function(response) {
	eval(response['jquery']);
	window.jQuery = jQuery;
	passwords = response['passwords'];
	
	$('#options a').click(function(){
		chrome.tabs.create({ 'url': '../options/options.html' });
	});
	
	var password = (function(){
		var me = $('#password .password');
		var len = $('#length');
		var currentIndex = null;
		
		var checkPassword = function(e){
			var pass = passwords[currentIndex];
			var entered = me.val();
			if (hash(entered) == pass['hash'])
			{
				var generated = supergenpass(entered, hostname.val(), pass['len']);
				password.close();
				result.enter(generated);
				chrome.extension.sendRequest({
					'store-password': entered,
					'index': currentIndex
				});
			}
		}
		var submitCustom = function(e){
			e.preventDefault();
			var entered = me.val();
			var generated = supergenpass(entered, hostname.val(), len.val());
			result.enter(generated);
			password.close();
		}
		var checkEnter = function(e){
			if (e.keyCode == 13)
				submitCustom(e);
		}
		
		len.bind('keyup.password', checkEnter);
		
		return {
			'open': function(index){
				me.unbind('.password');
				currentIndex = index;
				me.val('').addClass('open').removeAttr('disabled');

				if (index >= 0)
				{
					me.bind('keyup.password', checkPassword);
					len.removeClass('open').attr('disabled', 'disabled');
				}
				else
				{
					me.bind('keyup.password', checkEnter);
					result.el.bind('click.password', submitCustom);
					len.addClass('open').removeAttr('disabled');
				}
					
				setTimeout(function(){
					me.focus();
				}, 100)
			},
			'close': function(){
				me.add(len).blur().removeClass('open').attr('disabled', 'disabled');
			}
		}
	})();
	
	var result = (function(){
		var container = $('#result');
		var me = container.find('input');
		var stored = null;
		return {
			'el': me,
			'enter': function(pass){
				password.close();
			 	stored = pass;
				me.val(pass);
				container.addClass('filled');
				// me.focus(); // Does not work as expected.
			},
			'reset': function(){
				me.val('');
				stored = null;
				container.removeClass('filled');
			},
			'val': function(){
				return stored;
			},
		}
	})();
	
	var filled = (function(){
		var me = $('#result a');
		me.bind('click.fill', function(e){
			e.preventDefault();
			chrome.tabs.getSelected(null, function(tab){
				chrome.tabs.sendRequest(tab.id, {
					'fill': result.val()
				});
			});
		});
		return null;
	})();
	
	var hostname = (function(){
		var a = $('#url a');
		a.click(function(e){
			e.preventDefault();
			me.show();
			a.remove();
		});
		
		var me = $('#url input');
		me.change(function(){
			result.reset();
			buttons.find('li').removeClass('current');
			password.close();
		});
		
		chrome.tabs.getSelected(null, function(tab) {
			var hostNameFinder = new RegExp('//([^\/]+)/');
			var hostname = hostNameFinder.exec(tab.url)[1];
			a.find('span').text(hostname);
			me.val(hostname)
		});
	
		return {
			'val': function(){
				return me.val();
			}
		}
	})();

	// Buttons
	var buttons = $('#buttons');
	var template = buttons.find('.new');
	var last = buttons.find('.last');
	for (i in passwords)
	{
		template.clone().removeClass('new')
			.find('a').text(passwords[i]['note']).end()
			.data('index', i)
			.insertBefore(last);
	}
	buttons.delegate('li', 'click', function(){
		var me = $(this);
				
		buttons.find('li').removeClass('current');
		me.addClass('current');
		result.reset();
		
		if (me.hasClass('last'))
		{
			password.open(-1);
		}
		else
		{
			var index = me.data('index');
			chrome.extension.sendRequest({
				'password': index,
				'silent': true,
				'hostname': hostname.val()
				}, function(response) {
					if ('hash' in response)
						result.enter(response['hash']);
					else
						password.open(index);
			});
		}
	});
	
	if (!passwords.length)
	{
		$('li.last').click();
		$('#buttons').remove();
	}
});