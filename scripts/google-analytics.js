// GA anlytics scripts slightly modified for the extension
// see https://developer.chrome.com/extensions/tut_analytics.html

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-31019541-1']);
// If we got here, we're fleexing the page - user is necessarily logged in
//_gaq.push(['_setCustomVar', 3, 'Is logged in', 'true', 3]);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


// Universal Analytics -----------------------------------------------------------------

// universal analytics was slightly modified as it doesn't work as-is in chrome extension
// see http://stackoverflow.com/questions/16135000/how-do-you-integrate-universal-analytics-in-to-chrome-extensions/17770829#17770829
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','chrome-extension://gbblinkjgdfpfijckdifhdiijmcpjebj/scripts/analytics.js','ga');

ga('create', 'UA-31019541-2', 'fleex.tv');