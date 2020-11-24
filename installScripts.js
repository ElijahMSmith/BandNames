chrome.runtime.onInstalled.addListener(function(){
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: 'discord.com'}, //Default: only discord
                })
            ],
            actions: [
                new chrome.declarativeContent.ShowPageAction()
            ]
        }]);
    });

    //Stored default url for options page
    chrome.storage.sync.set({allUrls: ['discord.com']}, function(){
        console.log("Set default url to Discord.com. This can be changed in the options page of this extension.");
    });
});