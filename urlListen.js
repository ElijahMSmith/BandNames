var bandNames = [{hostContains: "discord.com"}]; //Default on installation

var urlListener = () => {
    //Need this to be enabled for ANY of the chrome decided URLs
    var newWindow = window.open("suggestion_new_window.html", "BandNames", "width=350,height=200,status=no,scrollbars=yes,resizable=no");
    window.blur();
    newWindow.focus();
};

//-----------------------------------

chrome.runtime.onInstalled.addListener(function(){
    chrome.storage.sync.set({allUrls: ["discord.com"]}, function(){
        console.log("Stored discord.com as the default site for this popup to be enabled. You can remove this site at any time in the options page.");
    });

    chrome.webNavigation.onCompleted.addListener(urlListener, {url: bandNames});
});

//Depending on the action to be taken, update the bandNames list, then reset web listener
chrome.runtime.onMessage.addListener((requestJSON, sender, sendResponse) => {

        let url = requestJSON.targetUrl;

        if(requestJSON.takeAction === 'add'){
            bandNames.push({hostContains: url});
        } else if(requestJSON.takeAction === 'delete'){

            //Manual search, indexOf was always returning -1
            var index = -1;
            for(var i = 0; i < bandNames.length; i++){
                console.log(url + " vs " + bandNames[i].hostContains);
                if(bandNames[i].hostContains === url){
                    console.log("Match found");
                    index = i;
                    break;
                }
            }

            console.log("index = " + index);
            bandNames.splice(index, 1);
        } else if(requestJSON.takeAction === 'clear'){
            bandNames = [];
        } else {
            sendResponse(false);
        }

        
        chrome.webNavigation.onCompleted.removeListener(urlListener);

        //If array is empty, will register every URL instead of none (not sure why it does this)
        //As such, we'll just not add the popup listener period in this case
        if(bandNames.length > 0)
            chrome.webNavigation.onCompleted.addListener(urlListener, {url: bandNames});

        console.log(bandNames);
        sendResponse(true);
    }
);