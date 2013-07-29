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
(function(storage, hash, supergenpass){
	'use strict';
	/*global chrome:false*/

	var jQuery;
	var settings = storage();

	get('js/jquery-2.0.0.min.js', function(res){ jQuery = res; });

	chrome.extension.onRequest.addListener(function(req, sender, sendResponse){
		if ('settings' in req)
		{ // Options have been updated, new settings.passwords available
			storage(req.settings);
			settings = req.settings;

			// Inform all tabs
			chrome.windows.getAll({ populate: true }, function(windows){
				windows.forEach(function(w){
					w.tabs.forEach(function(tab){
						chrome.tabs.sendRequest(tab.id, {
							settings: settings
						});
					});
				});
			});
			sendResponse({});
		}

		else if ('init' in req)
		{ // A new tab wants to work with us, let's give it info
			if (sender.tab !== null && /^http/.test(sender.tab.url))
			{
				chrome.pageAction.show(sender.tab.id);
			}
			var whitelisted = false;
			settings.whitelist.forEach(function(pattern){
				// Escape special characters
				var regex = pattern.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

				regex = '^http://.*' + regex + '/';

				if (sender.tab.url.match(regex)) {
					whitelisted = true;
					return false;
				}
			});
			if (whitelisted) {
				sendResponse({});
			} else {
				sendResponse({
					passwords: settings.passwords,
					supergenpass: supergenpass,
					jquery: jQuery
				});
			}
		}

		else if ('password' in req)
		{ // A page wants to enter a password into a field
			var index = req.password;
			if (!('password' in settings.passwords[index]) && !('silent' in req))
			{ // The password has not yet been cached
				var stop = false;
				var second_attempt = false;
				while (!stop)
				{
					var entered = prompt_password(settings.passwords[index], second_attempt);
					if (!entered)
					{ // Cancelled
						stop = true;
					}
					else if (hash(entered) === settings.passwords[index].hash)
					{ // Correct
						stop = true;
						settings.passwords[index].password = entered;
					}
					else
					{ // Wrong password
						second_attempt = true;
					}
				}
			}
			if ('password' in settings.passwords[index])
			{
				sendResponse({
					hash: supergenpass(settings.passwords[index].password, req.hostname || sender.tab.url, settings.passwords[index].len)
				});
			}
			else
			{
				sendResponse({});
			}
		}
	});

	function prompt_password(password, second_attempt)
	{
		var txt = '';
		if (second_attempt)
		{
			txt += 'Password "' + password['note'] + '" is incorrect. Perhaps you have made a mistake?\n\n';
			txt += 'Try again:';
		}
		else
		{
			txt += 'Password "' + password['note'] + '" is locked.\n';
			txt += 'Please unlock it by entering it in the field below:';
		}
		return prompt(txt);
	}

	function get(src, callback)
	{
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {if (xhr.readyState == 3){
			callback(xhr.responseText);
		}};
		xhr.open('GET', chrome.extension.getURL(src), true);
		xhr.send();
	}
})(storage, hash, supergenpass);
