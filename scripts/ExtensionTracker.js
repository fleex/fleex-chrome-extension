function ExtensionTracker(){
	
	var msgPasser = new ExtMessagePasser();

	this.trackGaEvent = function(event){

		var msg = $.extend({gaEvent: event}, {type: "trackGaEvent"});
		msgPasser.sendMsgToBackground(msg);
	}
}