var serverBaseUrl = "http://localhost:6564";
var url = document.URL;
var pageLanguageCode = "en";
var title = document.getElementsByTagName("title")[0].innerHTML;
$.ajax({
	url: serverBaseUrl + '/WebPage/Fleex',
	data: { url: url, languageIsoCode : pageLanguageCode, title: title},
	type: 'POST'
}).done(function(infos){
	debugger;
	if(infos){
		var userId = infos.userId;
		var isInSprint = infos.isInSprint;
		var webPageId = infos.webPageId;
		var relationship = infos.relationship;
		var nativeLanguageCode = infos.nativeLanguageCode;
		var vocabularyManager = new VocabularyManager({ code:'eng' }, { code: nativeLanguageCode }, 'webPage', 'test');
		vocabularyManager.init($('body'));
	}
});
