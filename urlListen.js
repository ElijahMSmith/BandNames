// ------------------ Setup Section ------------------

// Global url array so we don't have to reload every update
let popupUrls = []

// Opens popup when listener called
let urlListener = () => {
	let newWindow = window.open(
		"suggestion_new_window.html",
		"BandNames",
		"width=500,height=330,status=0,scrollbars=1,resizable=no"
	)
	window.blur()
	newWindow.focus()
}

// ---------------- Function Section ----------------

// Remove and reapply urlListener with updated array
function reloadUrlListener() {
	chrome.webNavigation.onCompleted.removeListener(urlListener)

	// Set new listener with updated url list
	// If array is empty, will register every URL instead of none (not sure why it does this)
	// As such, we'll just not add the popup listener period in this case
	if (popupUrls.length > 0)
		chrome.webNavigation.onCompleted.addListener(urlListener, {
			url: popupUrls,
		})

	// Remove listener with old url list
	console.log("Added listener for " + popupUrls.length + " urls:")
	console.log(popupUrls)

	urlListener()
}

// ---------------- Procedural Section ----------------

// Every time an event this script listens to triggers the script to perform an action, this function is run.
// This way, we can repopulate the array after the browser restarts and as such, popupUrls is cleared,
// When we next navigate to a URL recognized by urlListener the last time it was applied.
chrome.storage.sync.get({ allUrls: [] }, function (result) {
	console.log("Updating URL set")

	// Reinsert all urls to storage, log to console success
	// Get urls array from allUrls key
	let urlsArray = result.allUrls

	if (urlsArray.length == 0) {
		console.log("install")

		// First set this url in storage
		chrome.storage.sync.set({ allUrls: ["discord.com"] }, function () {
			console.log(
				"Stored discord.com as the default site for this popup to be enabled. You can remove this site at any time in the options page."
			)
		})

		// Set default to discord
		urlsArray.push("discord.com")
	}

	// For each url string
	for (let i = 0; i < urlsArray.length; i++) {
		// Create new p element and append to urlsDiv
		popupUrls.push({ hostContains: urlsArray[i] })
	}

	reloadUrlListener()
})

// ------------------ Message Listener ------------------

// Depending on the action to be taken, update the popupUrls list, then reset web listener
// NOTE: This listener only updates the array locally. Storage changes are made options.js, which will be loaded automatically next startup
chrome.runtime.onMessage.addListener((requestJSON, sender, sendResponse) => {
	let url = requestJSON.targetUrl

	if (requestJSON.takeAction === "add") {
		// Add the new url to the list
		popupUrls.push({ hostContains: url })
	} else if (requestJSON.takeAction === "delete") {
		// Manual search for the url in the list (since indexOf wasn't behaving)
		let index = -1
		for (let i = 0; i < popupUrls.length; i++) {
			console.log(url + " vs " + popupUrls[i].hostContains)
			if (popupUrls[i].hostContains === url) {
				console.log("Match found")
				index = i
				break
			}
		}

		// Remove the element from the array
		if (index >= 0) popupUrls.splice(index, 1)
	} else if (requestJSON.takeAction === "clear") {
		// Clear the array
		popupUrls = []
	} else {
		// Not our problem
		sendResponse(false)
	}

	reloadUrlListener()
	sendResponse(true) // Mark success
})
