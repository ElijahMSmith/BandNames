//------------------ Procedural Section ------------------
//Global url array so we don't have to reload every update
var popupUrls = [];

//Opens popup when listener called
var urlListener = () => {
    var newWindow = window.open("suggestion_new_window.html", "BandNames", "width=350,height=240,status=no,scrollbars=yes,resizable=no");
    window.blur();
    newWindow.focus();
};

//Remove and reapply urlListener with updated array
function loadUrlListener(){
    //Remove listener with old url list
    chrome.webNavigation.onCompleted.removeListener(urlListener);

    //Set new listener with updated url list
        //If array is empty, will register every URL instead of none (not sure why it does this)
        //As such, we'll just not add the popup listener period in this case
    if(popupUrls.length > 0)
        chrome.webNavigation.onCompleted.addListener(urlListener, {url: popupUrls});

    console.log("Added listener for " + popupUrls.length + " urls");
}

//------------------ Message Listener ------------------

//Depending on the action to be taken, update the popupUrls list, then reset web listener
//NOTE: This listener only updates the array locally. Storage changes are made options.js, which will be loaded automatically next startup
chrome.runtime.onMessage.addListener((requestJSON, sender, sendResponse) => {
    var url = requestJSON.targetUrl;

    if(requestJSON.takeAction === 'add'){
        //Add the new url to the list
        popupUrls.push({hostContains: url});
    } else if(requestJSON.takeAction === 'delete'){
        //Manual search for the url in the list (since indexOf wasn't behaving)
        var index = -1;
        for(var i = 0; i < popupUrls.length; i++){
            console.log(url + " vs " + popupUrls[i].hostContains);
            if(popupUrls[i].hostContains === url){
                console.log("Match found");
                index = i;
                break;
            }
        }
        
        //Remove the element from the array
        if(index >= 0)
            popupUrls.splice(index, 1);
    } else if(requestJSON.takeAction === 'clear'){
        //Clear the array
        popupUrls = [];
    } else {
        //Not our problem
        sendResponse(false);
    }

    loadUrlListener();

    //Mark successes
    console.log(popupUrls);
    sendResponse(true);
});

//------------------- Runtime Listeners -------------------

//Set default url to discord.com when installed for the first time
chrome.runtime.onInstalled.addListener(function(){
    //First set this url in storage
    chrome.storage.sync.set({allUrls: ["discord.com"]}, function(){
        console.log("Stored discord.com as the default site for this popup to be enabled. You can remove this site at any time in the options page.");

        //Also start the array storage
        popupUrls.push({hostContains: "discord.com"});

        //Now add the listener for this url
        loadUrlListener();
    });
});

chrome.runtime.onStartup.addListener(function(){
    //Get all current urls in storage and add them to the list
    chrome.storage.sync.get({allUrls: []}, function(result){
        //Holds all URLs we are watching for the popup to trigger

        for(url of result.allUrls){
            popupUrls.push({hostContains: url});
        }

        console.log(popupUrls);

        //Now add the listener for all the urls we found 
        loadUrlListener();
    });
});