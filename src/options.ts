const urlInput = <HTMLInputElement>document.getElementById("urlInput")
const addUrlButton = <HTMLButtonElement>document.getElementById("addUrlButton")
const deleteUrlButton = <HTMLButtonElement>(
	document.getElementById("deleteUrlButton")
)
const urlsDiv: HTMLElement = document.getElementById("enabledUrls")
const clearButton = <HTMLButtonElement>document.getElementById("clearButton")

// Stores all the URLs that we're using for our listener
let urlsList: string[] = []

// When page reloads, flush whatever is in the urls array and reload everything from storage
window.onload = (): void => {
	console.log("onLoad")
	urlsList = []

	chrome.storage.sync.get({ allUrls: [] }, (result): void => {
		const urlsArray: string[] = result.allUrls
		for (let i = 0; i < urlsArray.length; i++) {
			// For each url, create new p element with the value and append to urlsDiv
			let urlItem: HTMLElement = document.createElement("p")
			urlItem.innerHTML = urlsArray[i]
			urlItem.classList.add("urlItem")
			document.body.appendChild(urlItem)
			urlsList.push(urlsArray[i])
		}
	})
}

// For debugging
const printFromStorage = (): void => {
	console.log("printFromStorage")
	chrome.storage.sync.get({ allUrls: [] }, (result): void => {
		const urlsArray: string[] = result.allUrls
		for (let i = 0; i < urlsArray.length; i++)
			console.log("urlsArray[" + i + "] = " + urlsArray[i])
	})
}

// Checks for a URL in the list, returning true/false
const alreadyHaveUrl = (url: string): boolean => {
	return urlsList.indexOf(url) !== -1
}

// Click listener to add button
addUrlButton.addEventListener("click", (): void => {
	console.log("addUrlButtonClick")
	const newUrlText: string = urlInput.value.toLowerCase()

	// If url matching input text already exists in list, don't add it again
	if (alreadyHaveUrl(newUrlText)) {
		alert("That URL is already added to the list!")
		return
	}

	// Create a new p element with this url and add it to the document
	const newUrlItem: HTMLElement = document.createElement("p")
	newUrlItem.classList.add("urlItem")
	newUrlItem.innerHTML = newUrlText
	document.body.appendChild(newUrlItem)

	// Push new URL value to internal list
	urlsList.push(newUrlText)

	// Reinsert all urls to storage
	chrome.storage.sync.set({ allUrls: urlsList }, (): void => {
		console.log("Updated stored URLs (added " + newUrlText + ")")
	})

	// Update actual listener in urlListen
	chrome.runtime.sendMessage(
		{ takeAction: "add", targetUrl: newUrlText },
		(response): void => {
			console.log(
				response
					? "Successfully processed URL addition"
					: "URL addition failed"
			)
		}
	)

	urlInput.value = ""
})

// Click listener to delete button
deleteUrlButton.addEventListener("click", (): void => {
	console.log("deleteUrlButtonClick")
	const newUrlText: string = urlInput.value.toLowerCase()

	// If no url matching the input text exists, can't do anything
	if (!alreadyHaveUrl(newUrlText)) {
		alert("That URL is not in the list!")
		return
	}

	// Remove this URL from the array
	const index: number = urlsList.indexOf(newUrlText)
	urlsList.splice(index, 1)

	// Remove this URL from visible list
	const urlItems: HTMLCollectionOf<Element> = document.getElementsByClassName(
		"urlItem"
	)
	urlItems[index].remove()

	// Reinsert shortened url array to storage
	chrome.storage.sync.set({ allUrls: urlsList }, () => {
		console.log("Updated stored URLs (removed " + newUrlText + ")")
	})

	// Update actual listener in urlListen
	chrome.runtime.sendMessage(
		{ takeAction: "delete", targetUrl: newUrlText },
		(response): void => {
			console.log(
				response
					? "Successfully processed URL deletion"
					: "URL deletion failed"
			)
		}
	)

	urlInput.value = ""
})

// Add listener to clear urls button
clearButton.addEventListener("click", (): void => {
	console.log("clearButtonClick")

	// Clear all urls from storage
	chrome.storage.sync.clear((): void => {
		const urlItems: HTMLCollectionOf<Element> = document.getElementsByClassName(
			"urlItem"
		)

		for (let i = urlItems.length - 1; i >= 0; i--) urlItems[i].remove()
		urlsList = []
	})

	// Update actual listener in urlListen
	chrome.runtime.sendMessage({ takeAction: "clear" }, (response): void => {
		console.log(response ? "Cleared all URLs" : "Failed to clear all URLs")
	})
})

// Executes function corresponding to various key presses
urlInput.addEventListener("keyup", (event: KeyboardEvent): void => {
	console.log("urlInputChange")

	if (event.code === "Enter") {
		event.preventDefault()
		addUrlButton.click()
	}

	if (event.code === "Delete") {
		event.preventDefault()
		deleteUrlButton.click()
	}
})
