/**
 * This file deals with messages to the user
 */

storage.unseen('instructions').then(function(){
	return storage.passwords.list();
}).then(function(passwords){
	if (passwords.length) return;
	chrome.tabs.create({
		url: chrome.extension.getURL('src/options/options.html#instructions')
	});
});
