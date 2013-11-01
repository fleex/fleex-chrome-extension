$(function(){
	var serverBaseUrl = chrome.runtime.getManifest().permissions[1];

	function onSuccess (data) {
		if(data!='True'){ 
			onFailure(); 
		} else{
			fleexPage();
		}
	}

	function onFailure () {
		// TODO
		alert('TODO: Show login error message in extension\'s popup');
	}

	// Login user
	$('#submitButton').click(function(){
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
})