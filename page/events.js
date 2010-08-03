// Update passwords on request
chrome.extension.onRequest.addListener(function(req, sender, sendResponse){
	if ('passwords' in req)
		passwords = req['passwords'];
	if ('fill' in req)
	{
		$('input[type="password"]').val(req['fill']);
		Popup.moveToCenter().text('Passwords updated to ' + req['fill']).show('slow');
		setTimeout(function(){ Popup.hide('slow'); }, 2000);
	}
	sendResponse({});
});