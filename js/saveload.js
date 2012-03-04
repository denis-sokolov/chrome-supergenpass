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

var field_separator = '//CGPSEP/$$}}//';
var item_separator = '//CGPSEP2/$$}}//';

load = function ()
{
	if (!('passwords' in localStorage) || localStorage['passwords'] === '')
		return [];
	passwords = [];
	var items = localStorage['passwords'].split(item_separator);
	for (var i in items)
	{
		item = items[i].split(field_separator);
		passwords.push({
			'note': item[0],
			'len': item[1],
			'hash': item[2]
		});
	}
	return passwords;
};

save = function (passwords)
{
	var result = [];
	for (var i in passwords)
	{
		var item = passwords[i];
		while (item['note'].indexOf(field_separator) >= 0)
			item['note'] = item['note'].replace(field_separator, '');
		while (item['note'].indexOf(item_separator) >= 0)
			item['note'] = item['note'].replace(item_separator, '');
		result.push([item['note'], item['len'], item['hash']].join(field_separator));
	}
	localStorage['passwords'] = result.join(item_separator);
};
