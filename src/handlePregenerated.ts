console.log("global test 1")

let maxStoredLength = 0 // Longest word we have
let minStoredLength = 30

const bandNames: string[][] = [] // Ever growing list of good band names
const cumFreq: number[] = []

let lastGeneration = -1

const newBandName = (): void => {
	// Pick new name and set new text
	let maxInput: string = maxCharInput.value,
		minInput: string = minCharInput.value
	const numberRegex = /^[0-9]{1,2}$/

	if (!numberRegex.test(maxInput)) maxInput = maxStoredLength.toString()

	if (!numberRegex.test(minInput)) minInput = minStoredLength.toString()

	// Parse that value into an integer, replacing it if out of bounds with the correct bound
	let maxSelection: number = parseInt(maxInput)
	let minSelection: number = parseInt(minInput)

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

	minCharInput.value = minSelection.toString()
	maxCharInput.value = maxSelection.toString()

	// The number of names with length less than or equal to maxSelection and more than or equal to minSelection
	const possibleNames: number =
		cumFreq[maxSelection] -
		(cumFreq[minSelection - 1] ? cumFreq[minSelection - 1] : 0)

	// If we don't have any names to pick from, we did something wrong
	if (possibleNames === 0) {
		console.error("ERROR: No names loaded to pick from.")
		return
	}

	const minGen: number = cumFreq[minSelection - 1]
		? cumFreq[minSelection - 1]
		: 0

	// Generate an index minGen <= index < minGen + range
	let generated: number = Math.floor(Math.random() * possibleNames) + minGen

	// Don't generate the same name two times in a row, unless there are no other names to generate
	if (possibleNames > 1) {
		while (generated === lastGeneration)
			generated = Math.floor(Math.random() * possibleNames) + minGen
	}

	console.log(
		`${possibleNames} possible names between ${minGen}-${
			minGen + possibleNames - 1
		}, generated index ${generated}`
	)

	// Move to the correct outer array index where the name in the full list that corresponds to the generated index lies
	let outerIndex = 0
	while (generated >= cumFreq[outerIndex]) outerIndex++

	// Pick the correct name corresponding to the generated index (generated - previous cumFreq value) in the array at outerIndex
	const innerIndex: number =
		generated - (cumFreq[outerIndex - 1] ? cumFreq[outerIndex - 1] : 0)

	// Pick the name and update suggestion text
	suggestion.innerText = bandNames[outerIndex][innerIndex]

	// After we let element attributes update, update box size to match size of the band name
	setTimeout((): void => {
		// Initially reset body to full size so we aren't constricting the newly inserted word
		// The word renders in one line, then we constrain the box to be smaller if we can so it fits better
		body.style.width = "450px"

		// Set display of suggestion to temporarily not take the entire width of the popup, letting us measure text width
		suggestion.style.display = "inline-block"

		// Note - the above happens so quickly that it isn't visible, but is required to make the math below work.
		// Moving that outside the timeout causes the popup to frequently be resizing and look really glitchy.

		// Get width of the two longest elements
		const suggestionWidth: number = suggestion.getBoundingClientRect().width
		const suggestionHeaderWidth: number =
			suggestionHeader.getBoundingClientRect().width
		const copyNameWidth: number = copyName.getBoundingClientRect().width
		const refreshNameWidth: number =
			refreshName.getBoundingClientRect().width
		const switchModeWidth: number = switchMode.getBoundingClientRect().width

		// Determine width of the longest of the three elements on the popup
		const newWidth: number = Math.max(
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
		switchMode.style.marginLeft = (newWidth - switchModeWidth) / 2 + "px"

		// Center in box
		suggestion.style.display = "block"

		lastGeneration = generated
	}, 100)
}

// Get all band names from JSON file
const loadNameData = async (): Promise<void> => {
	const response: Response | void = await fetch(
		"../loads/PreGenerated.json"
	).catch(function (error) {
		console.log("Fetch Error :-S", error)
		return
	})

	if (!response) {
		console.log("Looks like there was a problem - Response is void")
		return
	}

	if (response.status !== 200) {
		console.log(
			"Looks like there was a problem. Status Code: " +
				(response ? response.status : "N/A")
		)
		return
	}

	response.json().then((data): void => {
		const loadedNames: string[] = data.allNames

		for (let currentName of loadedNames) {
			// Get number of characters in name, update global min/max
			const noSpaces: number = currentName.replace(/ /g, "").length
			maxStoredLength =
				maxStoredLength > noSpaces ? maxStoredLength : noSpaces
			minStoredLength =
				minStoredLength < noSpaces ? minStoredLength : noSpaces

			// Push any required new arrays onto the end so that we have an array at the required index
			while (bandNames[noSpaces] === undefined) bandNames.push([])

			// Push this name onto array at correct index (the number of characters of the string)
			bandNames[noSpaces].push(currentName)

			// Add one to the index in cumFreq that this array corresponds to
			const curFreq: number = cumFreq[noSpaces]
			cumFreq[noSpaces] = curFreq === undefined ? 1 : curFreq + 1
		}

		// Move through cumFreq and add previous slot so that our array holds how many names are the length of the index or shorter
		for (let i = 0; i < cumFreq.length; i++) {
			const prev: number = cumFreq[i - 1]
			const curr: number = cumFreq[i]
			cumFreq[i] =
				(prev !== undefined ? prev : 0) +
				(curr !== undefined ? curr : 0)
		}

		// Set input to be our found max, then load up first band name
		maxCharInput.value = maxStoredLength.toString()
		minCharInput.value = minStoredLength.toString()
		newBandName()
	})
	console.log("Finished load")
}

// Button listener for copy name button
refreshName.addEventListener("click", (): void => {
	// Generate new band name for the popup and adjust content sizes
	newBandName()

	resetButton(refreshName)
})

loadNameData() // Call that function to load the band names
