var Popup_init = function() {
	var el = $('<div/>').css({
		'cursor': 'default',
		'position': 'absolute',
		'opacity': '0',
		'background-color': 'rgba(0,0,0,0.7)',
		'color': 'white',
		'padding': '5px 10px',
		'border-radius': '6px',
		'z-index': '10000',
	});
	el.appendTo('body');
	var my_state = null;
	var on_state_change = null;
	var hide_timeout = null;

	var hide = function(speed)
	{
		if (speed)
			el.animate({ 'opacity': 0 }, speed, function(){ my_state = null; el.hide(); })
		else
		{
			el.hide().css('opacity', 0);
			my_state = null;
		}
		return this;
	}

	el.click(function(){
		hide('fast');
	});

	Popup = {
		'hide': hide,
		'hide_in': function(timeout, speed)
		{
			hide_timeout = setTimeout(function(){
				Popup.hide(speed);
			}, 3000);	
		},
		'instructions': function(field, passwords)
		{
			this
				.hide().stop()
				.state('instructions')
				.text(passwords)
				.move(field).show('fast');
		},
		'layout': function(field)
		{
			this
				.hide().stop()
				.state('layout')
				.text('Make sure that you have the correct layout turned on.')
				.move(field).show('fast');
			this.hide_in(1500, 'slow');
		},
		'move': function(field)
		{
			offset = field.offset();
			el.css({
				'left': offset.left,
				'top': offset.top + field.height() + 5, // 5 for padding
			});
			return this;
		},
		'moveToCenter': function()
		{
			el.css({
				'left': '40%',
				'top': '50%',
			});
			return this;
		},
		'show': function(speed)
		{
			if (speed)
				el.show().animate({ 'opacity': 1 }, speed)
			else
				el.show().css('opacity', 1);
			return this;
		},
		'state': function (state, callback)
		{
			if (arguments.length == 0)
				return my_state;
			my_state = state;
			if (on_state_change)
				on_state_change(state);
			clearTimeout(hide_timeout);
			if (callback)
				on_state_change = callback;
			return this;
		},
		'stop': function ()
		{
			el.stop(true, true);
			clearTimeout(hide_timeout);
			return this;
		},
		'text': function (txt)
		{
			if (typeof txt == 'object')
			{
				if (txt.length == 0)
				{
					url = chrome.extension.getURL('options/options.html');
					html = '<em>ChromeGenPass</em><br>';
					html += 'You have no passwords saved.<br>';
					html += 'Add passwords on the ';
					html += '<a href="'+url+'#settings" style="color:white" target="_blank">options page</a>.';
					el.html(html);
				}
				else
				{ // Passwords
					var html = '<ol style="list-style-type:none;padding:0;margin:0">';
					var confirm_key = passwords.length > 9 ? 'q' : '';
					for (i in passwords)
						html += '<li>' + (Number(i) + Number(1)) + confirm_key + ': ' + passwords[i]['note'];
					html += '</ol>';
					el.html(html)
				}
			}
			else
			{
				el.text(txt);	
			}
			return this;
		},
	}
};

Popup = {
	'init': Popup_init
};
