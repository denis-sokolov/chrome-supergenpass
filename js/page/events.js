// Update passwords on request
chrome.extension.onRequest.addListener(function(req, sender, sendResponse){
	if ('passwords' in req)
		passwords = req['passwords'];
	sendResponse({});
});