// Get server base url from settings
$.getJSON(chrome.extension.getURL('config.json'), function(settings) {
	var serverBaseUrl = settings.serverBaseUrl;
	var isAuthenticated = false;
	var aspnetAuthCookieName = '.ASPXAUTH'

	// A function to respond to an authentication status change
	function authChangeCallback (authenticated) {
		if(authenticated){
			isAuthenticated = true;
			chrome.browserAction.setPopup({ 'popup': '' });
		} else{
			isAuthenticated = false;
			chrome.browserAction.setPopup({ 'popup': 'popup.html' });
		}
	}

	// Initially check if user is authenticated
	chrome.cookies.get(
		{
			'url':serverBaseUrl,
			'name':aspnetAuthCookieName
		}, 
		function(cookie){
			if(cookie){
				authChangeCallback(true);
			} else{
				authChangeCallback(false);
			}
		}
	)

	// Listen to changes on the authentication cookie
	chrome.cookies.onChanged.addListener(function(changeInfo){
		if(changeInfo.cookie.name==aspnetAuthCookieName && serverBaseUrl.indexOf(changeInfo.cookie.domain)!=-1){
			if(changeInfo.removed && changeInfo.cause != 'overwrite'){
				authChangeCallback(false);
			} else{
				authChangeCallback(true);
			}
		}
	})

	// Register onClick event on BrowserAction (only raised if no popup is set)
	chrome.browserAction.onClicked.addListener(function(tab){
		// should always be the case (by construction)
		if(isAuthenticated){
			fleexTab(tab)
		} else{
			// A safeguard, as this should never happen
			chrome.tabs.create({ 'url': serverBaseUrl+'/Account/Login' });
		}
	})
});

// messaging ---------------------------------------------------------------------

// listen to track ga events
chrome.extension.onMessage.addListener(
  	function(request, sender, sendResponse) {
  		// track GAnalytics events
	    if (request.type == "trackGaEvent" && request.gaEvent){
	    	var gaEvent = request.gaEvent;
	    	_gaq.push(['_trackEvent', gaEvent.category, gaEvent.action, gaEvent.label, gaEvent.value]);
			ga('send', 'event', {
			    eventCategory: gaEvent.category,
			    eventAction: gaEvent.action,
			    eventLabel: gaEvent.label,
			    eventValue: gaEvent.value
			});
	    }
	}
);