var boot = function(event){
	var el = event.target;
	if (el.tagName === 'INPUT' && el.type === 'password') {
		chrome.runtime.sendMessage('init');
		document.removeEventListener('focusin', boot);
	}
};
document.addEventListener('focusin', boot);
