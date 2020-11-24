chrome.webNavigation.onCompleted.addListener(function() {
    var newWindow = window.open("suggestion_popup.html", "BandNames", "width=300,height=200,status=no,scrollbars=yes,resizable=no");
    window.blur();
    newWindow.focus();
}, {url: [{hostEquals : 'discord.com'}]});