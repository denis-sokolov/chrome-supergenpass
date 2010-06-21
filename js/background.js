{ // Initialization
	var passwords = load();
	var jQuery = null;
	get('js/jquery-1.4.2.min.js', function(res){ jQuery = res; });
}

chrome.extension.onRequest.addListener(function(req, sender, sendResponse){
	if ('passwords' in req)
	{ // Options have been updated, new passwords available
		// Update local passwords
		passwords = req['passwords'];
		
		// Inform all tabs
		chrome.windows.getAll({ 'populate': true }, function(windows){
			for (i in windows){ for (j in windows[i].tabs){
				chrome.tabs.sendRequest(windows[i].tabs[j].id, {
					'passwords': passwords,
				})
			}}
		});
		sendResponse({});
	}
	
	else if ('init' in req)
	{ // A new tab wants to work with us, let's give it info
		sendResponse({
			'passwords': passwords,
			'supergenpass': supergenpass,
			'jquery': jQuery,
		});
	}
	
	else if ('password' in req)
	{ // A page wants to enter a password into a field
		var index = req['password'];
		if (!('password' in passwords[index]))
		{ // The password has not yet been cached
			var stop = false;
			var second_attempt = false;
			while (!stop)
			{
				var entered = prompt_password(passwords[index], second_attempt);
				if (entered == null)
				{ // Cancelled
					stop = true;
				}
				else if (hash(entered) == passwords[index]['hash'])
				{ // Correct
					stop = true;
					passwords[index]['password'] = entered;
				}
				else
				{ // Wrong password
					second_attempt = true;
				}
			}
		}
		sendResponse({
			'hash': supergenpass(passwords[index]['password'], sender['tab']['url'], passwords[index]['len'])
		});
	}
});

function prompt_password(password, second_attempt)
{
	var txt = '';
	if (second_attempt)
	{
		txt += 'Password "' + password['note'] + '" is incorrect. Perhaps you have made a mistake?\n\n';
		txt += 'Try again:';
	}
	else
	{
		txt += 'Password "' + password['note'] + '" is locked.\n';
		txt += 'Please unlock it by entering it in the field below:';
	}
	return prompt(txt)
}

function get(src, callback)
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {if (xhr.readyState == 3){
		callback(xhr.responseText);
	}};
	xhr.open('GET', chrome.extension.getURL(src), true);
	xhr.send();
}

/*
	Reference for future use.
	chrome.pageAction.show(sender.tab.id);

	chrome.pageAction.onClicked.addListener(function(tab){
		chrome.tabs.sendRequest(tab.id, 'run');
	});
*/