//Get all the elements we interact with
let urlInput = document.getElementById('urlInput');
let addUrlButton = document.getElementById('addUrlButton');
let urlsDiv = document.getElementById('enabledUrls');
let clearButton = document.getElementById('clearButton');
let urlsList = []; //Initialize empty urls array

//When page reloads, flush whatever is in the urls array and reload everything from storage
window.onload = function(){
    urlsList = []; //Flush urls array

    //On page load, query all urls from storage and add p for each to urlsDiv
    chrome.storage.sync.get({allUrls: []}, function(result){
        //Get urls array from allUrls key
        var urlsArray = result.allUrls;
        //For each url string
        for(var i = 0; i < urlsArray.length; i++){
            //Create new p element and append to urlsDiv
            var urlItem = document.createElement("p");
            urlItem.innerHTML = urlsArray[i];
            urlItem.classList.add('urlItem');
            document.body.appendChild(urlItem);
            urlsList.push(urlsArray[i]);
        }
    });
};

//Checks thorugh urlsList to verify if url has already been incorporated to list, returning true if it is found
function alreadyHaveUrl(url){
    console.log("called - " + urlsList.length);
    for(var i = 0; i < urlsList.length; i++){
        console.log(urlsList[i] + "vs" + url);
        if(urlsList[i] === url)
            return true;
    }
    return false;
}

//Click listener to add button
addUrlButton.addEventListener("click", function(){
    //Get input text
    var newUrlText = urlInput.value;

    //If url matching input text already exists in list, don't add it again
    if(alreadyHaveUrl(newUrlText)){
        alert("That URL is already added to the list!");
        return;
    }

    //Create a new p element with this url
    var newUrlItem = document.createElement("p");
    newUrlItem.classList.add("urlItem");
    newUrlItem.innerHTML = urlInput.value;
    document.body.appendChild(newUrlItem);

    //Add this url as a string to the urls list
    urlsList.push(urlInput.value);

    //Reinsert all urls to storage, log to console success
    chrome.storage.sync.set({allUrls: urlsList}, function(){
        console.log("Updated stored URLs");
    });
});

//Executes the add url process via clicking on the button when user presses the enter key
urlInput.addEventListener("keyup", function(event) {
    //Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        //Cancel the default action
        event.preventDefault();
        //Trigger the button element with a click
        addUrlButton.click();
    }
});

//Add listener to clear urls button
clearButton.addEventListener("click", function(){
    //Clear all urls from storage
    chrome.storage.sync.clear(function(){
        let urlItems = document.getElementsByClassName('urlItem');
        for(var i = urlItems.length - 1; i >= 0; i--){
            urlItems[i].remove();
        }
    });
    //Flush urls array
    urlsList = [];
})