//Get body tag, suggestion text/header, and copy/refresh buttons
var suggestion = document.getElementById('suggestion');
var copyName = document.getElementById('copyName');
var refreshName = document.getElementById('refreshName');
var suggestionHeader = document.getElementById('suggestionHeader');
var maxCharInput = document.getElementById('maxCharInput');
var body = document.getElementsByTagName('body')[0];

var bandNames = []; //Ever growing list of good band names
var maxNameLength = 10;
var maxStoredLength = -1;

//Reset button to default color
function resetButton(button){
    //Show button has been clicked by changing appearance slightly
    button.style.backgroundColor = "#ff3340";

    //After brief delay, reset button to default style
    setTimeout(function(){
        button.style.backgroundColor = "#ff737c";
    }, 100);
}

//Copies text input (suggested band name) to clipboard
function copyTextToClipboard(text) {
    //Create a textbox field where we can insert text to. 
    var copyFrom = document.createElement("textarea");
  
    //Set the text content to be the text you wished to copy.
    copyFrom.textContent = text;
  
    //Append the textbox field into the body as a child. 
    //"execCommand()" only works when there exists selected text, and the text is inside 
    //document.body (meaning the text is part of a valid rendered HTML element).
    document.body.appendChild(copyFrom);
  
    //Select all the text!
    copyFrom.select();
  
    //Execute command
    document.execCommand('copy');
  
    //De-select the text using blur(). 
    copyFrom.blur();
  
    //Remove the textbox field from the document.body, so no other JavaScript nor 
    //other elements can get access to this.
    document.body.removeChild(copyFrom);
}

function newBandName(){
    //Pick new name and set new text
    suggestion.innerText = bandNames[Math.floor(Math.random() * bandNames.length)];

    //After we let element attributes update, update box size to match size of the band name
    setTimeout(function(){
        //Initially reset body to full size so we aren't constricting the newly inserted word
        body.style.width = "300px";

        //Set display of suggestion to temporarily not take the entire width of the popup, letting us measure text width
        suggestion.style.display = "inline-block";

        //Get width of the two longest elements
        var suggestionWidth = suggestion.getBoundingClientRect().width;
        var suggestionHeaderWidth = suggestionHeader.getBoundingClientRect().width;
        var copyNameWidth = copyName.getBoundingClientRect().width;
        var refreshNameWidth = refreshName.getBoundingClientRect().width;

        //Determine width of the longest of the three elements on the popup
        var newWidth = Math.max(Math.max(suggestionWidth, copyNameWidth), suggestionHeaderWidth);

        //Update body size to max width of elements
        body.style.width = newWidth + "px";

        //Now to center buttons and title in the box

        //Update body size to max width of elements
        suggestionHeader.style.marginLeft = ((newWidth - suggestionHeaderWidth) / 2) + "px";
        copyName.style.marginLeft =  ((newWidth - copyNameWidth) / 2) + "px";
        refreshName.style.marginLeft =  ((newWidth - refreshNameWidth) / 2) + "px";

        //Center in box
        suggestion.style.display = "block";
    }, 1);
}

//Get all band names from JSON file
async function loadNameData() {
    const response = await fetch('BandNames.json')
        .catch(function(error){
            console.log('Fetch Error :-S', err);
        });

    if (response.status !== 200){
        console.log('Looks like there was a problem. Status Code: ' +
        response.status);
        return bandNames;
    }

    response.json().then(data => {
        bandNames = data.allNames;

        for(currentName of bandNames){
            //TODO: Sort into corrent index of array here
            let noSpaces = currentName.replace(" ", "").length;
            maxStoredLength = maxStoredLength > noSpaces ? maxStoredLength : noSpaces;
        }
        newBandName();
    });
}

loadNameData(); //Call that function to load the band names

//Button listener for copy name button
copyName.addEventListener("click", function() {
    //Copy band name to clipboard
    copyTextToClipboard(suggestion.innerHTML);

    resetButton(copyName);

    chrome.tabs.executeScript({
        file: 'openDiscordUsernameChange.js'
    });
});

//Button listener for copy name button
refreshName.addEventListener("click", function() {
    //Generate new band name for the popout and adjust content sizes
    newBandName();

    resetButton(refreshName);
});