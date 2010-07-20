chrome.extension.sendRequest({ 'init': true }, function(response) {
	eval(response['jquery']);
	window.jQuery = jQuery;
	passwords = response['passwords'];
	
	$('#options a').click(function(){
		chrome.tabs.create({ 'url': '../options/options.html' });
	});
	
	var password = (function(){
		var me = $('[name="password"]');
		var len = $('[name="length"]');
		var currentIndex = null;
		
		var checkPassword = function(e){
			var pass = passwords[currentIndex];
			var entered = me.val();
			if (hash(entered) == pass['hash'])
			{
				var generated = supergenpass(entered, hostname.val(), pass['len']);
				password.close();
				result.enter(generated);
				chrome.extension.sendRequest({
					'store-password': entered,
					'index': currentIndex
				});
			}
		}
		var submitCustom = function(e){
			e.preventDefault();
			var entered = me.val();
			var generated = supergenpass(entered, hostname.val(), len.val());
			result.enter(generated);
			password.close();
		}
		var checkEnter = function(e){
			if (e.keyCode == 13)
				submitCustom(e);
		}
		
		len.bind('keyup.password', checkEnter);
		
		return {
			'open': function(index){
				me.unbind('.password');
				currentIndex = index;
				me.val('').addClass('open').removeAttr('disabled');

				if (index >= 0)
				{
					me.bind('keyup.password', checkPassword);
					len.removeClass('open').attr('disabled', 'disabled');
				}
				else
				{
					me.bind('keyup.password', checkEnter);
					result.el.bind('click.password', submitCustom);
					len.addClass('open').removeAttr('disabled');
				}
					
				setTimeout(function(){
					me.focus();
				}, 100)
			},
			'close': function(){
				me.add(len).blur().removeClass('open').attr('disabled', 'disabled');
			}
		}
	})();
	
	var result = (function(){
		var me = $('#result');
		return {
			'el': me,
			'enter': function(pass){
				password.close();
				me.val(pass)
				// me.focus(); // Does not work as expected.
			},
			'reset': function(){
				me.val('');
			},
		}
	})();
	
	var hostname = (function(){
		var a = $('a[name="url"]');
		a.click(function(e){
			e.preventDefault();
			me.show();
			a.remove();
		});
		
		var me = $('input[name="url"]');
		me.change(function(){
			result.reset();
			buttons.find('li').removeClass('current');
			password.close();
		});
		
		chrome.tabs.getSelected(null, function(tab) {
			var hostNameFinder = new RegExp('//([^\/]+)/');
			var hostname = hostNameFinder.exec(tab.url)[1];
			a.find('span').text(hostname);
			me.val(hostname)
		});
	
		return {
			'val': function(){
				return me.val();
			}
		}
	})();

	// Buttons
	var buttons = $('#buttons');
	var template = buttons.find('.new');
	var last = buttons.find('.last');
	for (i in passwords)
	{
		template.clone().removeClass('new')
			.find('a').text(passwords[i]['note']).end()
			.data('index', i)
			.insertBefore(last);
	}
	buttons.delegate('li', 'click', function(){
		var me = $(this);
				
		buttons.find('li').removeClass('current');
		me.addClass('current');
		result.reset();
		
		if (me.hasClass('last'))
		{
			password.open(-1);
		}
		else
		{
			var index = me.data('index');
			chrome.extension.sendRequest({
				'password': index,
				'silent': true,
				'hostname': hostname.val()
				}, function(response) {
					if ('hash' in response)
						result.enter(response['hash']);
					else
						password.open(index);
			});
		}
	});
});