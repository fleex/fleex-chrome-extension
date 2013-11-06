// The main function, that fleexes the page
function fleexTab (tab) {
	// Get server base url from settings
	$.getJSON(chrome.extension.getURL('config.json'), function(settings) {
		var serverBaseUrl = settings.serverBaseUrl;

		// Inject local js dependencies
		chrome.tabs.executeScript(tab.id, { file: 'scripts/jquery-1.8.3.js' });

		// Fetch (remote) or (static + dynamic) js dependencies
		$.when.apply($, [
			$.ajax(chrome.extension.getURL('scripts/google-analytics.js')),
			$.ajax(serverBaseUrl+'/Scripts/libs/underscore-1.5.1.js'), 
			$.ajax(serverBaseUrl+'/Scripts/libs/jquery/jquery.tokenize.js'), 
			$.ajax(serverBaseUrl+'/Scripts/libs/jquery/jquery.highlight.js'), 
			$.ajax(serverBaseUrl+'/Scripts/libs/twitter-bootstrap/bootstrap-tooltip.js'), 
			$.ajax(serverBaseUrl+'/Scripts/libs/twitter-bootstrap/bootstrap-popover.js'), 
			$.ajax(serverBaseUrl+'/Scripts/libs/twitter-bootstrap/plugins/bootstrap-classyTooltip.js'), 
			$.ajax(serverBaseUrl+'/Scripts/libs/twitter-bootstrap/plugins/bootstrap-classyPopover.js'), 
			$.ajax(serverBaseUrl+'/Scripts/shared/Tracker.js'),
			$.ajax(serverBaseUrl+'/Scripts/app/shared/BrowserDetect.js'),
			$.ajax(serverBaseUrl+'/Scripts/app/shared/LanguageCodes.js'),
			$.ajax(serverBaseUrl+'/Scripts/app/shared/MicrosoftTranslator.js'),
			$.ajax(serverBaseUrl+'/Scripts/app/shared/WordAnalyzer.js'),
			$.ajax(serverBaseUrl+'/Scripts/app/shared/VocabularyManager.js')
		]).done(function() {
			// Inject remote js dependencies
			for (var i = 0; i < arguments.length; i++) {
				// Replace relative urls to absolute urls
				var code = arguments[i][0].replace(/url(( )*)?:(( )*)?'\//g,"url: '"+serverBaseUrl+"/");
				// Jsonp calls are not supported in chrome, and we don't need them
				code = code.replace(/(')?dataType(')?(( )*)?:(( )*)?'jsonp'(( )*)?,/, '')
				chrome.tabs.executeScript(tab.id, { 'code': code });
			};

			// Inject css styles into page
			$.ajax(serverBaseUrl+'/Content/less/extension/styles.less').done(function(res){
	            chrome.tabs.insertCSS(tab.id, { code: res[0] })
			})
			
			// Execute content script to actually fleex the page
			chrome.tabs.executeScript(tab.id, { file: 'scripts/fleex-page.js' });

			// Close popup (if needed)
			// window.close();
		});
	})
}