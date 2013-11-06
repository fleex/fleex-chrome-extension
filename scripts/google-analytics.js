// Classic Analytics -------------------------------------------------------------------

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-31019541-1']);
// If we got here, we're fleexing the page - user is necessarily logged in
_gaq.push(['_setCustomVar', 3, 'Is logged in', 'true', 3]);

(function () {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'stats.g.doubleclick.net/dc.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

// Universal Analytics -----------------------------------------------------------------

(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date(); a = s.createElement(o),
    m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-31019541-2', 'fleex.tv');

// Send the clientId to the server for server-side tracking
ga(function(tracker) {
    var clientId = tracker.get('clientId');
    $.ajax({
        url: '/User/SetUAClientId', 
        type:'POST',
        data: { clientId: clientId }
    })
});

ga('set', 'dimension3', 'false'); // for all hits in this page, user is NOT logged in