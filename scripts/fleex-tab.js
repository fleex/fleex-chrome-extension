// The main function, that fleexes the page
function fleexTab (tab) {
	// Get server base url from settings
	$.getJSON(chrome.extension.getURL('config.json'), function(settings) {
		var serverBaseUrl = settings.serverBaseUrl;

		$.ajax({
			type:'GET',
			url:serverBaseUrl+'/Scripts/app/video/VocabularyManager.js',
			success:function(res){
				// Define VocabularyManager in the scope of the page
				chrome.tabs.executeScript(tab.id, { code: res });

				// Inject css styles to page
				chrome.tabs.insertCSS(tab.id, { file: 'styles/fleexed-page.css' })

				// Execute content script to actually fleex the page
				chrome.tabs.executeScript(tab.id, { file: 'scripts/fleex-page.js' });

				window.close();
			}
		})
	})
}