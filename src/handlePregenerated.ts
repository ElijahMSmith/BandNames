const pregenNames: string[][] = []
const pregenCumulativeFreq: number[] = []
let minPregenLength: number = Number.MAX_SAFE_INTEGER
let maxPregenLength: number = -1

let lastPregen = -1

const newPregenName = (): void => {
	// Pick new name and set new text
	let maxInput: string = maxCharInput.value,
		minInput: string = minCharInput.value
	const numberRegex = /^[0-9]{1,2}$/

	if (!numberRegex.test(maxInput)) maxInput = maxPregenLength.toString()

	if (!numberRegex.test(minInput)) minInput = minPregenLength.toString()

	// Parse that value into an integer, replacing it if out of bounds with the correct bound
	let maxSelection: number = parseInt(maxInput)
	let minSelection: number = parseInt(minInput)

	// Fix maxSelection to not exceed either min or max boundaries
	if (maxSelection < minPregenLength) maxSelection = minPregenLength
	if (maxSelection > maxPregenLength) maxSelection = maxPregenLength

	// Fix minSelection to not exceed either min or max boundaries
	if (minSelection < minPregenLength) minSelection = minPregenLength
	if (minSelection > maxPregenLength) minSelection = maxPregenLength

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
		pregenCumulativeFreq[maxSelection] -
		(pregenCumulativeFreq[minSelection - 1]
			? pregenCumulativeFreq[minSelection - 1]
			: 0)

	// If we don't have any names to pick from, we did something wrong
	if (possibleNames === 0) {
		console.error("ERROR: No names loaded to pick from.")
		return
	}

	const minGen: number = pregenCumulativeFreq[minSelection - 1]
		? pregenCumulativeFreq[minSelection - 1]
		: 0

	// Generate an index minGen <= index < minGen + range
	let generated: number = Math.floor(Math.random() * possibleNames) + minGen

	// Don't generate the same name two times in a row, unless there are no other names to generate
	if (possibleNames > 1) {
		while (generated === lastPregen)
			generated = Math.floor(Math.random() * possibleNames) + minGen
	}

	console.log(
		`${possibleNames} possible names between ${minGen}-${
			minGen + possibleNames - 1
		}, generated index ${generated}`
	)

	// Move to the correct outer array index where the name in the full list that corresponds to the generated index lies
	let outerIndex = 0
	while (generated >= pregenCumulativeFreq[outerIndex]) outerIndex++

	// Pick the correct name corresponding to the generated index (generated - previous pregenCumulativeFreq value) in the array at outerIndex
	const innerIndex: number =
		generated -
		(pregenCumulativeFreq[outerIndex - 1]
			? pregenCumulativeFreq[outerIndex - 1]
			: 0)

	// Pick the name and update suggestion text
	suggestion.innerText = pregenNames[outerIndex][innerIndex]
	lastPregen = generated
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

			minPregenLength = Math.min(minPregenLength, noSpaces)
			maxPregenLength = Math.max(maxPregenLength, noSpaces)

			// Push any required new arrays onto the end so that we have an array at the required index
			while (pregenNames[noSpaces] === undefined) pregenNames.push([])

			// Push this name onto array at correct index (the number of characters of the string)
			pregenNames[noSpaces].push(currentName)

			// Add one to the index in pregenCumulativeFreq that this array corresponds to
			const curFreq: number = pregenCumulativeFreq[noSpaces]
			pregenCumulativeFreq[noSpaces] = !curFreq ? 1 : curFreq + 1
		}

		// Move through pregenCumulativeFreq and add previous slot so that our array holds how many names are the length of the index or shorter
		for (let i = 0; i < pregenCumulativeFreq.length; i++) {
			const prev: number = pregenCumulativeFreq[i - 1]
			const curr: number = pregenCumulativeFreq[i]
			pregenCumulativeFreq[i] =
				(prev !== undefined ? prev : 0) +
				(curr !== undefined ? curr : 0)
		}

		// Set input to be our found max, then load up first band name
		maxCharInput.value = maxPregenLength.toString()
		minCharInput.value = minPregenLength.toString()
		newPregenName()
	})
	console.log(`Finished loading ${path}`)
}

// Button listener for refresh button
refreshName.addEventListener("click", (): void => {
	// Generate new band name for the popup and adjust content sizes
	newPregenName()

	resetButton(refreshName)
})

loadPregenNameData() // Call that function to load the band names
