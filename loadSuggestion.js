var bandNames = [
    "Auxilery Cheese",
    "Intestinal Distress",
    "Hard Varnish",
    "Muskrat Love",
    "Petite Failure",
    "Burly Definition",
    "Thirsty Road",
    "Difficult Combination",
    "Puzzled Bread",
    "Broken Meaning",
    "Discreet Throat",
    "Suitable Soup",
    "Determined Opinion",
    "Nasty Bedroom",
    "Interesting Wife",
    "Administrative Sister",
    "Additional Winner",
    "Icy Passenger",
    "Drab Improvement",
    "Illustrious Hair",
    "Billowy Contract",
    "Cynical Expression",
    "Misty Entertainment",
    "Bite-Sized Variety",
    "Filthy Growth",
    "Bewildered Emotion",
    "Flagrant Internet",
    "Acid Basket",
    "Lame Importance",
    "Tenuous Reputation",
    "Watery Data",
    "Scared Meat",
    "Heavenly Proposal",
    "Subdued Context",
    "Safe Economics",
    "Willing Product",
    "Nonchalant Love",
    "Secretive Steak",
    "Receptive Ability",
    "Rare Passenger",
    "Uninterested Breath",
    "Actual Desk",
    "Impossible Song",
    "Gamy Math",
    "Truculent Chest",
    "Lovely Outcome",
    "Irate Truth",
    "Lowly Reflection",
    "Abashed Tea",
    "Usused Strategy",
    "Maniacal Director",
    "Spiky Writing",
    "Uphappy Promotion",
    "Cuddly Mode",
    "Righteous Assignment",
    "Hellish Reputation",
    "Axiomatic Signature",
    "Adaptable Physics",
    "Lopsided Article",
    "Cowardly Instance",
    "Quarrelsome Physics",
    "Cool Language",
    "Selective Impression",
    "Actually Depression",
    "Unable Maintenance",
    "Salty Departure",
    "Curved Permission",
    "Inner Expression",
    "Handsome Awareness",
    "Gigantic Owner",
    "Unwieldy Reception",
    "Lowly Hospital",
    "Precious Philosophy",
    "Shaggy City",
    "Wiry Teachings",
    "Hearbreaking Charity",
    "Aberrant Suggestion",
    "Moldy Drama",
    "Significant Death",
    "Measly Recommendation",
    "Swift Cabinet",
    "Volatile Orange",
    "Briefly Clothed",
    "Spooky Alcohol",
    "Spooky Mixture",
    "Null Ratio",
    "Towering Comparison",
    "Breakable Depth",
    "Bite-Sized Person",
    "Ubiquitous Coffee",
    "Rough Supermarket",
    "Trashy Climate",
    "Marrinated Mood",
    "Therapeutic Reading",
    "Sweltering Contribution",
    "Hospitable Groceries",
    "Agonizing Perspective",
    "Lumpy Perspective",
    "Smoggy Buyer",
    "Utopian Recipe",
    "Nauseating Client",
    "Ugliest Mud",
    "Simple Child",
    "Gruesome Height",
    "Absorbing Analysis",
    "Frightening Importance",
    "Thankful Emotion",
    "Spectacular Volume",
    "Kaput Leadership",
    "Stomry Director",
    "Wasteful Membership",
    "Wasteful Language",
    "Spiritual Virus",
    "Subsequent Virus",
    "Crabby Relationship",
    "Luxuriant Mud",
    "Woebegone Dinner",
    "Bumpy Truth",
    "Expensive Platform",
    "Far-Flung Attitude",
    "Free Attitude",
    "Unkempt Youth",
    "Pregnant Language",
    "Worthless Software",
    "Tedious Sister",
    "Incandescent Sister",
    "Puzzled Chemistry",
    "Uninsterested Conclusion",
    "Spiky Chapter",
    "Jagged Variety",
    "Jagged Loss",
    "Barbarous Entertainment",
    "Nutritious Friendship",
    "Draconian Interaction",
    "Charming Grocery",
    "Devilish Method",
    "Serious Poetry",
    "Absent Ability",
    "Industrious Anxiety",
    "Brief Energy",
    "Trashy Construction",
    "Consistent Depth",
    "Workable Foundation",
    "Unhealthy Revenue",
    "Vigorous Ear",
    "Scattered Negotiation",
    "Berserk Mode",
    "Permissible Error",
    "Asorted Error",
    "Loving Measurement"
]; //Ever growing list of good band names

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

//Get body tag and copy button
var body = document.getElementsByTagName('body')[0];
var copyName = document.getElementById('copyName');

//Button listener for copy name button
copyName.addEventListener("click", function() {
    //Show button has been clicked by changing appearance slightly
    copyName.style.backgroundColor = "#ff3340";
    //Copy band name to clipboard
    copyTextToClipboard(suggestion.innerHTML);
    //After brief delay, reset button to default style
    window.setTimeout(resetButton, 100);
});

//Update suggestion header with randomly chosen band name
var suggestion = document.getElementById('suggestion');
suggestion.innerHTML = bandNames[Math.floor(Math.random() * bandNames.length)];

//Debugging
console.log("suggestion Width: " + suggestion.offsetWidth);
console.log("copyName Width: " + copyName.offsetWidth);

//NOT CURRENTLY WORKING:

//Update body size given new header size
var newWidth = Math.max(suggestion.offsetWidth, copyName.offsetWidth);

console.log("newWidth: " + newWidth);

//Update body size to max width of elements
body.offsetWidth = newWidth;