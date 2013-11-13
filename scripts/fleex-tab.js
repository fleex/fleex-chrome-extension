// reactivate tab everytime it changes
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	//activate tab
	chrome.browserAction.enable(tabId);
})

// The main function, that fleexes the page
function fleexTab (tab) {

	// Get server base url from settings
	$.getJSON(chrome.extension.getURL('config.json'), function(settings) {
		var serverBaseUrl = settings.serverBaseUrl;

		// Detect page language
		chrome.tabs.detectLanguage(tab.id, function(language){
			iso6391Language = language;
			
			// Inject local js dependencies
			chrome.tabs.executeScript(tab.id, { file: 'scripts/jquery-1.8.3.js' });

			// Fetch (remote) or (static + dynamic) js dependencies
			$.when.apply($, [
				$.ajax({ url:serverBaseUrl+'/Scripts/libs/underscore-1.5.1.js', dataType:'text'}),
				$.ajax({ url:serverBaseUrl+'/Scripts/libs/jquery/jquery.tokenize.js', dataType:'text'}),
				$.ajax({ url:serverBaseUrl+'/Scripts/libs/jquery/jquery.highlight.js', dataType:'text'}),
				$.ajax({ url:serverBaseUrl+'/Scripts/libs/twitter-bootstrap/bootstrap-tooltip.js', dataType:'text'}),
				$.ajax({ url:serverBaseUrl+'/Scripts/libs/twitter-bootstrap/bootstrap-popover.js', dataType:'text'}),
				$.ajax({ url:serverBaseUrl+'/Scripts/libs/twitter-bootstrap/plugins/bootstrap-classyTooltip.js', dataType:'text'}),
				$.ajax({ url:serverBaseUrl+'/Scripts/libs/twitter-bootstrap/plugins/bootstrap-classyPopover.js', dataType:'text'}),
				$.ajax({ url:serverBaseUrl+'/Scripts/shared/Tracker.js', dataType:'text'}),
				$.ajax({ url:serverBaseUrl+'/Scripts/shared/BrowserDetect.js', dataType:'text'}),
				$.ajax({ url:serverBaseUrl+'/Scripts/shared/LanguageCodes.js', dataType:'text'}),
				$.ajax({ url:serverBaseUrl+'/Scripts/shared/MicrosoftTranslator.js', dataType:'text'}),
				$.ajax({ url:serverBaseUrl+'/Scripts/shared/WordAnalyzer.js', dataType:'text'}),
				$.ajax({ url:serverBaseUrl+'/Scripts/shared/VocabularyManager.js', dataType:'text'}),
				$.ajax({ url:serverBaseUrl+'/Scripts/extension/PhrasesManager.js', dataType:'text'}),
				$.ajax({ url:serverBaseUrl+'/Scripts/extension/fleex-page.js', dataType:'text'}),
			]).done(function() {
				// Inject dependencies
				for (var i = 0; i < arguments.length; i++) {
					// Replace relative urls to absolute urls
					var code = arguments[i][0].replace(/url(( )*)?:(( )*)?'\//g,"url: '"+serverBaseUrl+"/");
					// Jsonp calls are not supported in chrome, and we don't need them
					code = code.replace(/(')?dataType(')?(( )*)?:(( )*)?'jsonp'(( )*)?,/, '');
					// Pass variables that are only accessible within the extension to the last script (fleex-page.js)
					if(i==arguments.length-1){
						code="var pageData = { 'serverBaseUrl':'"+serverBaseUrl+"', 'iso6391Language':'"+iso6391Language+"' };"+code;
					}
					// Inject script into page
					chrome.tabs.executeScript(tab.id, { 'code': code });
				};

				// Inject remote css styles
				$.ajax(serverBaseUrl+'/Content/less/extension/styles.less').done(function(code){
					// Replace relative urls to absolute urls
					var code = code
						.replace(/url\((.*)\)/g,"url("+serverBaseUrl+"$1)")
						.replace(/, url\((.*)\)/g,", url("+serverBaseUrl+"$1)") // for composite backgrounds
						.replace(/'/g, '');
					// Inject styles into page
		            chrome.tabs.insertCSS(tab.id, { 'code': code })
				})

				// disable this extension for this page (until the page changes!)
				chrome.browserAction.disable(tab.id);

				// Close popup
				window.close();
			});
		})

	})
}
