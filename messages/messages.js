
// Show messages for the user
if (!('messages-seen' in localStorage))
	localStorage['messages-seen'] = 0;
if (localStorage['messages-seen'] < 1)
{
	chrome.tabs.create({ 'url': 'options/options.html' });
	localStorage['messages-seen'] = 1;
}