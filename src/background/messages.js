/**
 * This file deals with messages to the user
 */

module.exports = function(storage){
	storage.hasUserSeen('instructions').then(function(seenInstructions){
		if (!seenInstructions)
			return storage.passwords.list().then(function(passwords){
				if (passwords.length) return;
				chrome.tabs.create({
					url: chrome.extension.getURL('src/options/options.html#instructions')
				});
			});
	});

	/**
	 * You should use notifications to inform about the updates
	 * without opening a new tab
	 * https://developer.chrome.com/extensions/notifications
	 */
};
