//Get body tag, suggestion text/header, and copy/refresh buttons
var suggestion = document.getElementById('suggestion');
var copyName = document.getElementById('copyName');
var refreshName = document.getElementById('refreshName');
var suggestionHeader = document.getElementById('suggestionHeader');
var maxCharInput = document.getElementById('maxCharInput');
var body = document.getElementsByTagName('body')[0];

var maxStoredLength = 0; //Longest word we have
var minStoredLength = 30;

var bandNames = []; //Ever growing list of good band names
var cumFreq = [];

var lastGeneration = -1;

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
    var maxInput = String(maxCharInput.value);
    var numberRegex = /^[0-9]?[0-9]?$/g;

    if(maxInput.match(numberRegex) === null){
        maxCharInput.value = maxStoredLength;
        maxInput = maxCharInput.value;
    }
    
    //Parse that value into an integer, replacing it if out of bounds with the correct bound
    var maxSelection = parseInt(maxInput);
    if(maxSelection < minStoredLength){
        maxSelection = minStoredLength;
        maxCharInput.value = minStoredLength;
    } else if(maxSelection > maxStoredLength){
        maxSelection = maxStoredLength;
        maxCharInput.value = maxStoredLength;
    }

    //The number of names with length less than or equal to maxSelection
    const maxGeneration = cumFreq[maxSelection];

    //If we don't have any names to pick from, we did something wrong
    if(maxGeneration === 0){
        console.error("ERROR: No names loaded to pick from.")
        return;
    }

    //Generate a random value 0 -> maxGeneration (exclusive)
    let generated = Math.floor(Math.random() * maxGeneration);

    //Don't generate the same name two times in a row, unless there are no other names to generate
    if(maxGeneration > 1){
        while(generated === lastGeneration)
            generated = Math.floor(Math.random() * maxGeneration);
    }

    //Move to the correct outer array index where the name in the full list that corresponds to the generated index lies
    let outerIndex = 0;
    while(generated >= cumFreq[outerIndex]) outerIndex++;

    //Pick the corrent name corresponding to the generated index (generated - previous cumFreq value)
    const innerIndex = generated - (cumFreq[outerIndex - 1] !== undefined ? cumFreq[outerIndex - 1] : 0);
    
    //Pick the name and update suggestion text
    suggestion.innerText = bandNames[outerIndex][innerIndex];

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

        lastGeneration = generated;
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
    }

    response.json().then(data => {
        var loadedNames = data.allNames;

        for(currentName of loadedNames){
            //Get number of characters in name, update global min/max
            let noSpaces = currentName.replace(" ", "").length;
            maxStoredLength = maxStoredLength > noSpaces ? maxStoredLength : noSpaces;
            minStoredLength = minStoredLength < noSpaces ? minStoredLength : noSpaces;

            //Push any required new arrays onto the end so that we have an array at the required index
            while(bandNames[noSpaces] === undefined)
                bandNames.push([]);
            
            //Push this name onto array at correct index (the number of characters of the string)
            bandNames[noSpaces].push(currentName);

            //Add one to the index in cumFreq that this array corresponds to
            const curFreq = cumFreq[noSpaces];
            cumFreq[noSpaces] = curFreq === undefined ? 1 : curFreq + 1;
        }
        
        //Move through cumFreq and add previous slot so that our array holds how many names are the length of the index or shorter
        for(let i = 0; i < cumFreq.length; i++){
            const prev = cumFreq[i-1];
            const curr = cumFreq[i];
            cumFreq[i] = (prev !== undefined ? prev : 0) + (curr !== undefined ? curr : 0);
        }

        //Set input to be our found max, then load up first band name
        maxCharInput.value = maxStoredLength;

        for(let i = 0; i < bandNames.length; i++){
            let concat = ""
            for(let j = 0; j < bandNames[i].length; j++){
                concat += bandNames[i][j] + ", "
            }
            console.log(concat)
        }

        console.log()
        console.log()

        for(let i = 0; i < cumFreq.length; i++){
            console.log(cumFreq[i])
        }

        console.log()
        console.log()

        console.log(bandNames.length)
        console.log(cumFreq.length)

        newBandName();
    });
}

//Button listener for copy name button
copyName.addEventListener("click", function() {
    //Copy band name to clipboard
    copyTextToClipboard(suggestion.innerHTML);

    resetButton(copyName);
});

//Button listener for copy name button
refreshName.addEventListener("click", function() {
    //Generate new band name for the popout and adjust content sizes
    newBandName();

    resetButton(refreshName);
});

loadNameData(); //Call that function to load the band names