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
	var legacy = function(){
		var passwords = [];
		var items = localStorage['passwords'].split('//CGPSEP2/$$}}//');
		for (var i in items)
		{
			item = items[i].split('//CGPSEP/$$}}//');
			passwords.push({
				'note': item[0],
				'len': item[1],
				'hash': item[2]
			});
		}
		return passwords;
	};

	var load = function(key, def) {
		if (!(key in localStorage) || localStorage[key] === '') {
			return def;
		}
		return JSON.parse(localStorage[key]);
	};

	var save = function(key, data) {
		localStorage[key] = JSON.stringify(data);
	};

	return {
		passwords: function(data) {
			if (data) {
				save('passwords', data);
			} else {
				// Legacy
				if ('passwords' in localStorage && localStorage['passwords'].indexOf('//CGPSEP/$$}}//') > -1) {
					var res = legacy();
					save('passwords', res);
					return res;
				}
				return load('passwords', []);
			}
		}
	};
})();
