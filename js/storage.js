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

var storage = (function(){
	var settings = {
		passwords: []
	};

	var load = function(){ settings = JSON.parse(localStorage.settings); },
		save = function(){ localStorage.settings = JSON.stringify(settings); };

	if (!('settings' in localStorage))
		save();

	load();

	// Retrieve legacy passwords
	if ('passwords' in localStorage && localStorage.passwords.indexOf('//CGPSEP/$$}}//') > -1) {
		localStorage.passwords.split('//CGPSEP2/$$}}//').forEach(function(password){
			item = password.split('//CGPSEP/$$}}//');
			settings.passwords.push({
				'note': item[0],
				'len': item[1],
				'hash': item[2]
			});
		});
		save();
		delete localStorage.passwords;
	}

	var api = function(data){
		if (data) {
			settings = data;
			save();
		} else {
			return settings;
		}
	};

	api.passwords = function(data){
		if (data) {
			settings.passwords = data;
			save();
		} else {
			return settings.passwords;
		}
	};

	return api;
})();
