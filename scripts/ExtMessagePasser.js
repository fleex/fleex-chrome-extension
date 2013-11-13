function ExtMessagePasser(){
	
	this.sendMsgToBackground = function(message, callback){
		chrome.extension.sendMessage(message, function(response) {
			if(typeof(callback) === 'function'){ callback(response); }
		});
	}

	// onMessageReceived should be a function(request, sender, sendResponse)
	this.listenMsgFomBackground = function(onMessageReceived){
		chrome.extension.onMessage.addListener(onMessageReceived);
	}
}