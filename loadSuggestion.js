//Reset button to default color
function resetButton(){
    copyName.style.backgroundColor = "#ff737c";
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

var bandNames = []; //Ever growing list of good band names

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
        suggestion.innerText = bandNames[Math.floor(Math.random() * bandNames.length)];
    });
}

loadNameData(); //Call that function to load the band names

//Get body tag, suggestion text, and copy button
var copyName = document.getElementById('copyName');
var suggestion = document.getElementById('suggestion');
var suggestionHeader = document.getElementById('suggestionHeader');
var body = document.getElementsByTagName('body')[0];

//Button listener for copy name button
copyName.addEventListener("click", function() {
    //Show button has been clicked by changing appearance slightly
    copyName.style.backgroundColor = "#ff3340";
    //Copy band name to clipboard
    copyTextToClipboard(suggestion.innerHTML);
    //After brief delay, reset button to default style
    window.setTimeout(resetButton, 100);
});

//Get width of the two longest elements
var suggestionWidth = suggestion.clientWidth;
var suggestionHeaderWidth = suggestionHeader.clientWidth;
var copyNameWidth = copyName.clientWidth;

//Debugging
console.log("suggestion Width: " + suggestionWidth);
console.log("suggestionHeader Width: " + suggestionHeaderWidth);
console.log("copyName Width: " + copyNameWidth);

//Determine width of the longest of the three elements on the popup
var newWidth = Math.max(Math.max(suggestionWidth, copyNameWidth), suggestionHeaderWidth);

//Also Debugging
console.log("newWidth: " + newWidth);
console.log("Pre reset: " + body.style.width);

//Update body size to max width of elements
body.style.width = newWidth + "px";

//Still Debugging
console.log("Post reset: " + body.style.width);