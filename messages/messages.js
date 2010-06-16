
// Show messages for the user
if (!('messages-seen' in localStorage))
	localStorage['messages-seen'] = 0;

// 1 is skipped due to a bug in version 2.0.
	
if (localStorage['messages-seen'] == 2)
{
	var msg = '';
	msg += 'I am terribly sorry, but a recent 2.0 updated had a very important security issue.\n\n';
	msg += 'Instead of generating a password for the page, the extension has been entering your *master* password onto the page.\n';
	msg += 'Due to this you could experience problems with logging in and/or creating wrong passwords during that period.\n\n';
	msg += 'I am terribly sorry and, hopefully, this will not happen again.\n\n';
	alert(msg);
	localStorage['messages-seen'] = 3;
}


if (localStorage['messages-seen'] < 2)
{
	chrome.tabs.create({ 'url': 'options/options.html' });
	// 	Do not update message count, options page will do that.
}