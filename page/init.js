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

// Preparation
CONFIRM_KEYCODES = [81, 113]; // Q, q
passwords = [];

when_there_are_password_fields(function(){
	// Turn on our toolkit on normal pages
	if (['http:','https:'].indexOf(document.location.protocol) > -1)
		work('input[type="password"]');
	// And for demonstration in help on options page
	else if (document.location.href == chrome.extension.getURL('options/options.html'))
		work('input[type="password"]:not([name])');
})

function when_there_are_password_fields(callback)
{
	if (/type=['"]?password/.test(document.body.innerHTML))
	{ // If password fields are present, prepare for work
		callback();
	}
	else
	{ // If no password fields are at the moment, they may appear later
		var catchNewFields = function(e) {
			if (e.target.type == 'password')
			{
				callback();
				document.removeEventListener('keypress', catchNewFields);
			}
		}
		document.addEventListener('keypress', catchNewFields, false);
	}
}
