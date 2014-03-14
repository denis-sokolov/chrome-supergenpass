var boot = function(event){
	var el = event.target;
	if (el.tagName === 'INPUT' && el.type === 'password') {
		chrome.runtime.sendMessage(['init', document.location.hostname]);
		document.removeEventListener('focusin', boot);
	}
};
document.addEventListener('focusin', boot);

/* explicitly fire a focus event for autofocused password fields */
if (document.activeElement && document.activeElement.tagName == 'INPUT' && document.activeElement.type == 'password') {
    var event =  document.createEvent("HTMLEvents");
    event.initEvent("focusin", true, true);
    document.activeElement.dispatchEvent(event);
}
