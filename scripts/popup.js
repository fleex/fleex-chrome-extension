$(function(){
	var serverBaseUrl = chrome.runtime.getManifest().permissions[1];

	function onSuccess (data) {
		$('body').removeClass('loading');
		if(data!='True'){ 
			onFailure(); 
		} else{
			fleexPage();
		}
	}

	function onFailure () {
		$('header').addClass('error');
	}

	// Login user
	$('#submitButton').click(function(){
		$('header').removeClass('error');
		$('body').addClass('loading');
		$.ajax({
			type:'POST',
			url:serverBaseUrl+'Account/BrowserExtensionLogin',
			data:{
				'email':$('#Email').val(),
				'password':$('#Password').val()
			},
			error:onFailure,
			success:onSuccess
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