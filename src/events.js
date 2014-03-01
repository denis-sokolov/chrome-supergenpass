chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
	if (message === 'init') {
		var tabId = sender.tab && sender.tab.id;
		chrome.tabs.executeScript(tabId, {file: 'jquery.min.js'});
		chrome.tabs.executeScript(tabId, {file: 'src/page/script.js'});
		chrome.tabs.insertCSS(tabId, {file: 'src/page/styles.css'});
	}
	if (message === 'passwords') {
		storage.passwords.list().then(sendResponse);
		return true; // Keep the channel open
	}
	if (message[0] === 'password') {
		if (!message[2]) throw new Error('Include password array and the domain.');
		storage.passwords.get(message[1], message[2]).then(sendResponse, function(){sendResponse('');});
		return true;
	}
	sendResponse({});
});
