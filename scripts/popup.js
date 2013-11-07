$(function(){
	function onSuccess (success) {
		$('body').removeClass('loading');
		if(success != 'True'){ 
			onFailure(); 
		} else{
			// Get current tab, and fleex it
			chrome.tabs.query({active:true,currentWindow:true},function(tab){
				fleexTab(tab[0]);
			});
		}
	}

	function onFailure () {
		$('header').addClass('error');
	}

	// Login user
	$('#submitButton').click(function(){
		$('header').removeClass('error');
		$('body').addClass('loading');
		// Get server base url from settings
		$.getJSON(chrome.extension.getURL('config.json'), function(settings) {
			var serverBaseUrl = settings.serverBaseUrl;
			$.ajax({
				type:'POST',
				url:serverBaseUrl+'/Account/BrowserExtensionLogin',
				data:{
					'email':$('#Email').val(),
					'password':$('#Password').val()
				},
				error:function(){
					onFailure();
				},
				success:function(success){
					onSuccess(success);
				}
			})
		})
	})

	// Listen to 'Enter' keypresses
	$('html').keyup(function (event) {
        //Enter key code = 13
        if (event.keyCode == '13') {
            $('#submitButton').click();
        }
    });
})