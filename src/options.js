// Get all the elements we interact with
let urlInput = (document.getElementById("urlInput"));
let addUrlButton = (document.getElementById("addUrlButton"));
let deleteUrlButton = (document.getElementById("deleteUrlButton"));
let urlsDiv = document.getElementById("enabledUrls");
let clearButton = (document.getElementById("clearButton"));
let urlsList = []; // Initialize empty urls array
// When page reloads, flush whatever is in the urls array and reload everything from storage
window.onload = () => {
    urlsList = []; // Flush urls array
    // On page load, query all urls from storage and add p for each to urlsDiv
    chrome.storage.sync.get({ allUrls: [] }, (result) => {
        // Reinsert all urls to storage, log to console success
        // Get urls array from allUrls key
        let urlsArray = result.allUrls;
        // For each url string
        for (let i = 0; i < urlsArray.length; i++) {
            // Create new p element and append to urlsDiv
            let urlItem = document.createElement("p");
            urlItem.innerHTML = urlsArray[i];
            urlItem.classList.add("urlItem");
            document.body.appendChild(urlItem);
            urlsList.push(urlsArray[i]);
        }
    });
};
// For debugging
let printFromStorage = () => {
    chrome.storage.sync.get({ allUrls: [] }, (result) => {
        // Reinsert all urls to storage, log to console success
        // Get urls array from allUrls key
        let urlsArray = result.allUrls;
        // For each url string
        for (let i = 0; i < urlsArray.length; i++)
            console.log("urlsArray[" + i + "] = " + urlsArray[i]);
    });
};
// Checks through urlsList to verify if url has already been incorporated to list, returning true if it is found
let alreadyHaveUrl = (url) => {
    if (urlsList.indexOf(url) !== -1)
        return true;
    return false;
};
// Click listener to add button
addUrlButton.addEventListener("click", () => {
    // Get input text
    let newUrlText = urlInput.value.toLowerCase();
    // If url matching input text already exists in list, don't add it again
    if (alreadyHaveUrl(newUrlText)) {
        alert("That URL is already added to the list!");
        return;
    }
    // Create a new p element with this url
    let newUrlItem = document.createElement("p");
    newUrlItem.classList.add("urlItem");
    newUrlItem.innerHTML = urlInput.value;
    document.body.appendChild(newUrlItem);
    // Add this url as a string to the urls list
    urlsList.push(urlInput.value);
    // Reinsert all urls to storage, log to console success
    chrome.storage.sync.set({ allUrls: urlsList }, () => {
        console.log("Updated stored URLs (added " + newUrlText + ")");
    });
    chrome.runtime.sendMessage({ takeAction: "add", targetUrl: newUrlText }, (response) => {
        console.log(response
            ? "Successfully processed URL addition"
            : "URL addition failed");
    });
    urlInput.value = "";
});
// Click listener to add button
deleteUrlButton.addEventListener("click", () => {
    // Get input text
    let newUrlText = urlInput.value.toLowerCase();
    // If no url matching the input text exists, can't do anything
    if (!alreadyHaveUrl(newUrlText)) {
        alert("That URL is not in the list!");
        return;
    }
    // Remove this URL from the array
    let index = urlsList.indexOf(newUrlText);
    urlsList.splice(index, 1);
    // Remove this URL from visible list
    let urlItems = document.getElementsByClassName("urlItem");
    urlItems[index].remove();
    // Reinsert shortened url array to storage, log
    chrome.storage.sync.set({ allUrls: urlsList }, () => {
        console.log("Updated stored URLs (removed " + newUrlText + ")");
    });
    chrome.runtime.sendMessage({ takeAction: "delete", targetUrl: newUrlText }, (response) => {
        console.log(response
            ? "Successfully processed URL deletion"
            : "URL deletion failed");
    });
    urlInput.value = "";
});
// Add listener to clear urls button
clearButton.addEventListener("click", () => {
    // Clear all urls from storage
    chrome.storage.sync.clear(() => {
        let urlItems = document.getElementsByClassName("urlItem");
        for (let i = urlItems.length - 1; i >= 0; i--)
            urlItems[i].remove();
        // Flush urls array
        urlsList = [];
    });
    chrome.runtime.sendMessage({ takeAction: "clear" }, (response) => {
        console.log(response ? "Cleared all URLs" : "Failed to clear all URLs");
    });
});
// Executes the add url process via clicking on the button when user presses the enter key
urlInput.addEventListener("keyup", (event) => {
    if (event.code === 'Enter') {
        // Cancel the default action
        event.preventDefault();
        // Trigger the button element with a click
        addUrlButton.click();
    }
    // Number 46 is the "Delete" key on the keyboard
    if (event.code === "Delete") {
        // Cancel the default action
        event.preventDefault();
        // Trigger the button element with a click
        deleteUrlButton.click();
    }
});
