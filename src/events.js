chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
	if (message === 'passwords') {
		storage.passwords.list().then(sendResponse);
		return true; // Keep the channel open
	}
	if (message[0] === 'init') {
		var domain = message[1];
		storage.whitelist.get().then(function(whitelists){
			if (whitelists.some(function(whitelist){
				return whitelist === domain ||
					domain.substr(-(whitelist.length+1)) === '.'+whitelist;
			})) {
				sendResponse({});
				return;
			}

			var tabId = sender.tab && sender.tab.id;
			chrome.tabs.executeScript(tabId, {file: 'jquery.min.js', allFrames: true});
			chrome.tabs.executeScript(tabId, {file: 'src/lib/i18n.js', allFrames: true});
			chrome.tabs.executeScript(tabId, {file: 'src/page/script.js', allFrames: true});
			chrome.tabs.insertCSS(tabId, {file: 'src/page/styles.css', allFrames: true});
			sendResponse({});
		});
		return true;
	}
	if (message[0] === 'password') {
		if (!message[2]) throw new Error('Include password array and the domain.');
		storage.passwords.get(message[1], message[2]).then(sendResponse, function(){sendResponse('');});
		return true;
	}
	sendResponse({});
});
