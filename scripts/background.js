// Get server base url
var serverBaseUrl = chrome.runtime.getManifest().permissions[1];
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
	if(changeInfo.cookie.name==aspnetAuthCookieName){
		if(changeInfo.removed && changeInfo.cause != 'overwrite'){
			authChangeCallback(false);
		} else{
			authChangeCallback(true);
		}
	}
})

// Register onClick event on BrowserAction (only raised if no popup is set)
chrome.browserAction.onClicked.addListener(function(){
	// should always be the case (by construction)
	if(isAuthenticated){ 
		fleexPage()
	} else{
		// A safeguard, as this should never happen
		chrome.tabs.create({ 'url': serverBaseUrl+'/Account/Login' });
	}
})