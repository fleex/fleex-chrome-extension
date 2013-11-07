var serverBaseUrl = "http://localhost:6564";
$.ajax(serverBaseUrl + '/User/GetUserInfos').done(function(userInfos){
	debugger;
	if(userInfos){
		
		var vocabularyManager = new VocabularyManager({ code:'eng' }, { code:userInfos.nativeLanguageCode }, 'webPage', 'test');
		vocabularyManager.init($('body'));
	}
});
