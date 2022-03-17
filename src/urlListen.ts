// Global url array so we don't have to reload every update
let popupUrls: chrome.events.UrlFilter[] = []

// Opens popup when listener called
const urlListener = (): void => {
	chrome.windows.create(
		{
			width: 500,
			height: 350,
			focused: true,
			url: chrome.runtime.getURL("./html/altPage.html"),
		},
		(window) => {}
	)
}

// Remove and reapply urlListener with updated array
const reloadUrlListener = (): void => {
	chrome.webNavigation.onCompleted.removeListener(urlListener)

	// Set new listener with updated url list
	// An empty URL filter registers for EVERY single URL, which we don't want
	if (popupUrls.length > 0)
		chrome.webNavigation.onCompleted.addListener(urlListener, {
			url: popupUrls,
		})

	console.log("Added listener for " + popupUrls.length + " urls:")
	console.log(popupUrls)
}

// Get all the URLs from storage
chrome.storage.sync.get({ allUrls: [] }, function (result): void {
	console.log("Updating URL set")

	const urlsArray: string[] = result.allUrls
	for (let i = 0; i < urlsArray.length; i++)
		popupUrls.push({ hostContains: urlsArray[i] })

	reloadUrlListener()
})

// Depending on the action to be taken, update the popupUrls list, then reset web listener
// NOTE: This listener only updates the array locally. Storage changes are made options.js, which will be loaded automatically next startup
chrome.runtime.onMessage.addListener(
	(requestJSON, sender, sendResponse): void => {
		const url: string = requestJSON.targetUrl

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

			if (index >= 0) popupUrls.splice(index, 1)
		} else if (requestJSON.takeAction === "clear") {
			popupUrls = []
		} else {
			// Not our problem
			sendResponse(false)
		}

		reloadUrlListener()
		sendResponse(true) // Mark success
	}
)
