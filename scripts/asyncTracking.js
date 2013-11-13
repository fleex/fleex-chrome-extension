// GA anlytics scripts slightly modified for the extension
// see https://developer.chrome.com/extensions/tut_analytics.html

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-31019541-1']);
// If we got here, we're fleexing the page - user is necessarily logged in
_gaq.push(['_setCustomVar', 3, 'Is logged in', 'true', 3]);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


// Universal Analytics -----------------------------------------------------------------

// TODO: universal analytics doesn't work as-is in chrome extension