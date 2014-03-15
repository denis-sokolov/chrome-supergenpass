var boot = function(event){
	var el = event.target;
	if (el.tagName === 'INPUT' && el.type === 'password') {
		chrome.runtime.sendMessage(['init', document.location.hostname]);
		document.removeEventListener('focusin', boot);
	}
};
document.addEventListener('focusin', boot);

/* Trigger a virtual focusin on autofocus elements */
if (document.activeElement) {
    boot({target: document.activeElement});
}
