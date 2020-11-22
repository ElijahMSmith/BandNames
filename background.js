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

    //Debug: get all urls and print to console

    /*function printFromStorage(){
        chrome.storage.sync.get({allUrls: []}, function(result){
            //Reinsert all urls to storage, log to console success
            //Get urls array from allUrls key
            var urlsArray = result.allUrls;
            //For each url string
            for(var i = 0; i < urlsArray.length; i++)
                console.log("urlsArray[" + i + "] = " + urlsArray[i]);
        });
    }

    printFromStorage();*/
});

window.addEventListener('click', (event) => {
    alert("click");
    console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
});

window.addEventListener('popstate', (event) => {
    alert("popstate");
    console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
});
  
//window.open("popup.html", "extension_popup", "width=300,height=133,status=no,scrollbars=yes,resizable=no");