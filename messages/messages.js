
// Show messages for the user
if (!('messages-seen' in localStorage))
	localStorage['messages-seen'] = 0;

// 1 is skipped due to a bug in version 2.0.
	
if (localStorage['messages-seen'] < 2)
{
	chrome.tabs.create({ 'url': 'options/options.html' });
	// 	Do not update message count, options page will do that.
}