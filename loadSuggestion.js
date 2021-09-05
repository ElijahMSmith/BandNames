// Get body tag, suggestion text/header, and copy/refresh buttons
let suggestion = document.getElementById("suggestion")
let copyName = document.getElementById("copyName")
let refreshName = document.getElementById("refreshName")
let generateRandomName = document.getElementById("generateRandomly")
let suggestionHeader = document.getElementById("suggestionHeader")
let maxCharInput = document.getElementById("maxCharInput")
let minCharInput = document.getElementById("minCharInput")
let body = document.getElementsByTagName("body")[0]

let maxStoredLength = 0 // Longest word we have
let minStoredLength = 30

let bandNames = [] // Ever growing list of good band names
let cumFreq = []

let lastGeneration = -1

// Reset button to default color
function resetButton(button) {
	// Show button has been clicked by changing appearance slightly
	button.style.backgroundColor = "#ff3340"

	// After brief delay, reset button to default style
	setTimeout(function () {
		button.style.backgroundColor = "#ff737c"
	}, 100)
}

// Copies text input (suggested band name) to clipboard
function copyTextToClipboard(text) {
	// Create a text box field where we can insert text to.
	let copyFrom = document.createElement("textarea")

	// Set the text content to be the text you wished to copy.
	copyFrom.textContent = text

	// Append the textbox field into the body as a child.
	// "execCommand()" only works when there exists selected text, and the text is inside
	// document.body (meaning the text is part of a valid rendered HTML element).
	document.body.appendChild(copyFrom)

	// Select all the text!
	copyFrom.select()

	// Execute command
	document.execCommand("copy")

	// De-select the text using blur().
	copyFrom.blur()

	// Remove the text box field from the document.body, so no other JavaScript nor
	// other elements can get access to this.
	document.body.removeChild(copyFrom)
}

function newBandName() {
	// Pick new name and set new text
	let maxInput = String(maxCharInput.value),
		minInput = String(minCharInput.value)
	const numberRegex = /^[0-9]{1,2}$/

	if (!numberRegex.test(maxInput))
		maxCharInput.value = maxInput = maxStoredLength

	if (!numberRegex.test(minInput))
		minCharInput.value = minInput = minStoredLength

	// Parse that value into an integer, replacing it if out of bounds with the correct bound
	let maxSelection = parseInt(maxInput)
	let minSelection = parseInt(minInput)

	console.log(minSelection, " ", maxSelection)

	// Fix maxSelection to not exceed either min or max boundaries
	if (maxSelection < minStoredLength) maxSelection = minStoredLength
	if (maxSelection > maxStoredLength) maxSelection = maxStoredLength

	// Fix minSelection to not exceed either min or max boundaries
	if (minSelection < minStoredLength) minSelection = minStoredLength
	if (minSelection > maxStoredLength) minSelection = maxStoredLength

	// Fix maxSelection being less than minSelection
	if (maxSelection < minSelection) {
		const temp = maxSelection
		maxSelection = minSelection
		minSelection = temp
	}

	minCharInput.value = minSelection
	maxCharInput.value = maxSelection

	// The number of names with length less than or equal to maxSelection and more than or equal to minSelection
	const possibleNames =
		cumFreq[maxSelection] -
		(cumFreq[minSelection - 1] ? cumFreq[minSelection - 1] : 0)

	// If we don't have any names to pick from, we did something wrong
	if (possibleNames === 0) {
		console.error("ERROR: No names loaded to pick from.")
		return
	}

	// Generate a random value 0 -> (possibleNames - 1)
	let generated = Math.floor(Math.random() * possibleNames)

	// Don't generate the same name two times in a row, unless there are no other names to generate
	if (possibleNames > 1) {
		while (generated === lastGeneration)
			generated = Math.floor(Math.random() * possibleNames)
	}

	console.log(`${possibleNames} possible names, generated index ${generated}`)

	// Add back the number of names of length less than our minimum so that generated is an index somewhere in the entirety of cumFreq
	generated += cumFreq[minSelection - 1] ? cumFreq[minSelection - 1] : 0

	// Move to the correct outer array index where the name in the full list that corresponds to the generated index lies
	let outerIndex = 0
	while (generated >= cumFreq[outerIndex]) outerIndex++

	// Pick the correct name corresponding to the generated index (generated - previous cumFreq value) in the array at outerIndex
	const innerIndex =
		generated - (cumFreq[outerIndex - 1] ? cumFreq[outerIndex - 1] : 0)

	// Pick the name and update suggestion text
	suggestion.innerText = bandNames[outerIndex][innerIndex]

	// After we let element attributes update, update box size to match size of the band name
	setTimeout(function () {
		// Initially reset body to full size so we aren't constricting the newly inserted word
		// The word renders in one line, then we constrain the box to be smaller if we can so it fits better
		body.style.width = "450px"

		// Set display of suggestion to temporarily not take the entire width of the popup, letting us measure text width
		suggestion.style.display = "inline-block"

		// Get width of the two longest elements
		let suggestionWidth = suggestion.getBoundingClientRect().width
		let suggestionHeaderWidth =
			suggestionHeader.getBoundingClientRect().width
		let copyNameWidth = copyName.getBoundingClientRect().width
		let refreshNameWidth = refreshName.getBoundingClientRect().width
		let generateRandomNameWidth =
			generateRandomName.getBoundingClientRect().width

		// Determine width of the longest of the three elements on the popup
		let newWidth = Math.max(
			Math.max(
				Math.max(suggestionWidth, copyNameWidth), // Longest element of the buttons or the name
				suggestionHeaderWidth // If the header is still longer, use that length
			),
			300 // Make the size AT LEAST 300 pixels regardless of previous comparisons
		)

		// Update body size to max width of elements
		body.style.width = newWidth + "px"

		// Now to center buttons and title in the box

		// Update body size to max width of elements
		suggestionHeader.style.marginLeft =
			(newWidth - suggestionHeaderWidth) / 2 + "px"
		copyName.style.marginLeft = (newWidth - copyNameWidth) / 2 + "px"
		refreshName.style.marginLeft = (newWidth - refreshNameWidth) / 2 + "px"
		generateRandomName.style.marginLeft =
			(newWidth - generateRandomNameWidth) / 2 + "px"

		// Center in box
		suggestion.style.display = "block"

		lastGeneration = generated
	}, 100)
}

// Get all band names from JSON file
async function loadNameData() {
	const response = await fetch("./loads/PreGenerated.json").catch(function (
		error
	) {
		console.log("Fetch Error :-S", err)
	})

	if (response.status !== 200) {
		console.log(
			"Looks like there was a problem. Status Code: " + response.status
		)
	}

	response.json().then((data) => {
		let loadedNames = data.allNames

		for (currentName of loadedNames) {
			// Get number of characters in name, update global min/max
			let noSpaces = currentName.replace(/ /g, "").length
			maxStoredLength =
				maxStoredLength > noSpaces ? maxStoredLength : noSpaces
			minStoredLength =
				minStoredLength < noSpaces ? minStoredLength : noSpaces

			// Push any required new arrays onto the end so that we have an array at the required index
			while (bandNames[noSpaces] === undefined) bandNames.push([])

			// Push this name onto array at correct index (the number of characters of the string)
			bandNames[noSpaces].push(currentName)

			// Add one to the index in cumFreq that this array corresponds to
			const curFreq = cumFreq[noSpaces]
			cumFreq[noSpaces] = curFreq === undefined ? 1 : curFreq + 1
		}

		// Move through cumFreq and add previous slot so that our array holds how many names are the length of the index or shorter
		for (let i = 0; i < cumFreq.length; i++) {
			const prev = cumFreq[i - 1]
			const curr = cumFreq[i]
			cumFreq[i] =
				(prev !== undefined ? prev : 0) +
				(curr !== undefined ? curr : 0)
		}

		// Set input to be our found max, then load up first band name
		maxCharInput.value = maxStoredLength
		minCharInput.value = minStoredLength
		newBandName()
	})
}

// Button listener for copy name button
copyName.addEventListener("click", function () {
	// Copy band name to clipboard
	copyTextToClipboard(suggestion.innerHTML)

	resetButton(copyName)
})

// Button listener for copy name button
refreshName.addEventListener("click", function () {
	// Generate new band name for the popout and adjust content sizes
	newBandName()

	resetButton(refreshName)
})

// Button listener for copy name button
generateRandomName.addEventListener("click", function () {
	// TODO: Implement

	resetButton(refreshName)
})

loadNameData() // Call that function to load the band names
