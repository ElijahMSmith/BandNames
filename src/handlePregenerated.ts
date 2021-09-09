let pregenNames: StorageLayout = {
	fullList: [],
	cumulativeFreq: [],
	minLength: Number.MAX_SAFE_INTEGER,
	maxLength: -1,
	currentWord: "PLACEHOLDER",
	currentWordIndex: -1,
}

// Get all band names from JSON file
const loadPregenNameData = async (): Promise<void> => {
	const path = "../loads/PreGenerated.json"
	const response: Response | void = await fetch(path).catch(function (error) {
		console.log("Fetch Error :-S", error)
		return
	})

	if (!response) {
		console.log(`Looks like there was a problem - ${path} response is void`)
		return
	}

	if (response.status !== 200) {
		console.log(
			`Looks like there was a problem. ${path} request status code: ${response.status}`
		)
		return
	}

	response.json().then((data): void => {
		const loadedNames: string[] = data.allNames

		for (let currentName of loadedNames) {
			// Get number of characters in name, update global min/max
			const noSpaces: number = currentName.replace(/ /g, "").length

			pregenNames.minLength = Math.min(pregenNames.minLength, noSpaces)
			pregenNames.maxLength = Math.max(pregenNames.maxLength, noSpaces)

			// Push any required new arrays onto the end so that we have an array at the required index
			while (pregenNames.fullList[noSpaces] === undefined) pregenNames.fullList.push([])

			// Push this name onto array at correct index (the number of characters of the string)
			pregenNames.fullList[noSpaces].push(currentName)

			// Add one to the index in pregenCumulativeFreq that this array corresponds to
			const curFreq: number = pregenNames.cumulativeFreq[noSpaces]
			pregenNames.cumulativeFreq[noSpaces] = !curFreq ? 1 : curFreq + 1
		}

		// Move through pregenCumulativeFreq and add previous slot so that our array holds how many names are the length of the index or shorter
		for (let i = 0; i < pregenNames.cumulativeFreq.length; i++) {
			const prev: number = pregenNames.cumulativeFreq[i - 1]
			const curr: number = pregenNames.cumulativeFreq[i]
			pregenNames.cumulativeFreq[i] =
				(prev !== undefined ? prev : 0) +
				(curr !== undefined ? curr : 0)
		}

		// Set input to be our found max, then load up first band name
		minCharInput.value = pregenNames.minLength.toString()
		maxCharInput.value = pregenNames.maxLength.toString()

		newWordFromList(pregenNames)
		updateSuggestion()
		console.log(`Finished loading ${path}`)
	})
}

// Button listener for refresh button
refreshName.addEventListener("click", (): void => {
	// Generate new band name for the popup and adjust content sizes
	newWordFromList(pregenNames)
	resetButton(refreshName)
})

loadPregenNameData() // Call that function to load the band names