let copyName = (document.getElementById("copyName"));
let switchMode = (document.getElementById("switchMode"));
// Button listener for copy name button
copyName.addEventListener("click", function () {
    // Copy band name to clipboard
    copyTextToClipboard(suggestion.innerHTML);
    resetButton(copyName);
});
// Button listener for copy name button
switchMode.addEventListener("click", function () {
    // TODO: Make stylistic changes depending on current mode and reshuffle listeners and such
    resetButton(refreshName);
});
