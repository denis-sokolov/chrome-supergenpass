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

chrome.extension.onRequest.addListener(function(req, sender, sendResponse){
	// Update passwords
	if ('passwords' in req)
		passwords = req['passwords'];

	// Fill page with password
	if ('fill' in req)
	{
		$('input[type="password"]').val(req['fill']);
		Popup.moveToCenter().text('Passwords updated to ' + req['fill']).show('slow');
		setTimeout(function(){ Popup.hide('slow'); }, 2000);
	}

	sendResponse({});
});
