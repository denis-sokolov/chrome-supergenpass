function init(selector){
	chrome.extension.sendRequest({ 'init': true }, function(response) {
		// Globalize jQuery
		eval(response['jquery']);
		window.jQuery = jQuery;
		
		// Prepare popup
		Popup = PopupFactory();
	
		// Data
		passwords = response['passwords'];
	
		// Main work			
		jQuery(selector)
			.live('focus', function(e){
				var me = $(this);
				if (me.val() == '')
					Popup.instructions(me, passwords);
			})
			.live('blur', function(e){
				if (Popup.state() != 'updated-to')
					Popup.hide('fast');
			})
			.live('keyup', function(e){
				var me = $(this);
				var value = me.val();
				var confirm_key = passwords.length > 9;
				if (value == '')
					Popup.instructions(me, passwords);	
				else
				{
					// Hide only if the popup is with instruction
					// Hide only if entered text cannot be understood as a password number
					if (Popup.state() == 'instructions' && (!confirm_key || !Number(value)))
						Popup.hide('fast');

					/*
						In certain layouts, there are different characters on number keys.
						If a user has a wrong layout and presses 1, he does not see a 1, but a bullet.
						He then waits for ChromeGenPass to do its bidding, but the extension
						never sees a 1, it sees a strange character.
						
						So this checks for this scenario.
						Any non-alphanumeric might mean that the layout is wrong.
						
						Moreover, in case everything is normal, we hide the popup both
						after a delay and on any subsequent keypress.
					*/
					if (value.length == 1 && 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.indexOf(value) == -1)
						Popup.layout(me);
					if (value.length > 1 && Popup.state() == 'layout')
						Popup.hide('fast');

					if ( 
						   // If there are more than 10 passwords and the key is CONFIRM_KEY
						   ( confirm_key && CONFIRM_KEYCODES.indexOf(e.keyCode) > -1)
						   // OR there are less than 10 passwords and this is a number key
						|| (!confirm_key && e.keyCode > 48 && e.keyCode < 59)
					)
					{
						if (confirm_key) // Remove confirm key
							value = value.substr(0, value.length - 1)
						var entered = parseInt(value);
						// If the string is incorrect, it will parse to NaN, which is
						// neither bigger nor small than any other number
						if (entered > 0 && entered <= passwords.length)
						{
							// 0-based array are cool 8)
							// 1-based people are not :)
							var index = entered - 1;
							var password = passwords[index];
							chrome.extension.sendRequest({ 'password': index }, function(response) {
								insert_password(me, response['hash'], password['note']);
							});
						} // end of correct input
					} // end of if e.keyCode in [0..9qQ]
				} // end of value is not empty
			}); // end keypress live
		  // Skipped indent
	}); // answer to send Request
} // init()


function PopupFactory()
{
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

	return {
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
}

function insert_password(field, password, note)
{
	field
		.val(password)
		.data('bgcolor', field.css('background-color'))
		.data('color', field.css('color'))
		.css({
			'background-color': '#DAFFB3',
			'color': 'black'
		});

	Popup.hide().stop().state('updated-to').move(field).text('Updated to ' + note).show('slow').hide_in(3000, 'slow');

	// Revert if entry has been changed
	var test = setInterval(function(){
		if (field.val() != password)
		{
			field.css({
				'background-color': field.data('bgcolor'),
				'color': field.data('color')
			});
			Popup.hide('fast');
			clearInterval(test);
		}
	}, 200);
}
