interface StorageLayout {
	fullList: string[][]
	cumulativeFreq: number[]
	minLength: number
	maxLength: number
}

const adjectives: StorageLayout = {
	fullList: [],
	cumulativeFreq: [],
	minLength: Number.MAX_SAFE_INTEGER,
	maxLength: -1,
}

const nouns: StorageLayout = {
	fullList: [],
	cumulativeFreq: [],
	minLength: Number.MAX_SAFE_INTEGER,
	maxLength: -1,
}

interface listIndices {
	outer: number
	inner: number
}

// Because of the way this algorithm picks from a list, this index is accumulated
// for every name encountered from left to right, even if the first name isn't at an early out-array index.
const currentAdjective = "PLACEHOLDER"
const currentNoun: string = "PLACEHOLDER"

const newRandomName = (): void => {
	if (adjectives.fullList.length === 0) {
		console.log(
			"No adjectives loaded due to an error, cannot generate a new name"
		)
		return
	}

	if (nouns.fullList.length === 0) {
		console.log(
			"No adjectives loaded due to an error, cannot generate a new name"
		)
		return
	}

	newRandomAdjective()
	newRandomNoun()
}

const newRandomAdjective = (): void => {
	if (adjectives.fullList.length === 0) {
		console.log(
			"No adjectives loaded due to an error, cannot generate a new name"
		)
		return
	}
	//TODO
}

const newRandomNoun = (): void => {
	if (nouns.fullList.length === 0) {
		console.log(
			"No adjectives loaded due to an error, cannot generate a new name"
		)
		return
	}
	//TODO
}

// Get all adjectives and nouns from JSON files
const loadNameData = async (
	path: string,
	destination: StorageLayout
): Promise<void> => {
	const response: Response | void = await fetch(path).catch(function (error) {
		console.log(`Fetch error at path '${path}: ${error}'`)
		return
	})

	// Error check responses
	if (!response) {
		console.log(
			`Looks like there was a problem - ${path} request response is void`
		)
		return
	} else if (response.status !== 200) {
		console.log(
			`Looks like there was a problem - ${path} response status code: ${response.status}`
		)
		return
	}

	response.json().then((data): void => {
		const loadedWords: string[] = data.allWords
		const fullList: string[][] = destination.fullList
		const cumulativeFrequency: number[] = destination.cumulativeFreq

		for (let word of loadedWords) {
			const len = word.length

			destination.minLength = Math.min(destination.minLength, len)
			destination.maxLength = Math.max(destination.maxLength, len)

			// Push any required new arrays onto the end so that we have an array at the required index
			while (fullList[len] === undefined) fullList.push([])
			fullList[len].push(word)

			const curFreq: number = cumulativeFrequency[len]
			cumulativeFrequency[len] = !curFreq ? 1 : curFreq + 1
		}

		// Move through cumulativeFreq and add previous slot so that our array holds how many names are the length of the index or shorter
		for (let i = 0; i < cumulativeFrequency.length; i++) {
			const prev: number = cumulativeFrequency[i - 1]
			const curr: number = cumulativeFrequency[i]
			cumulativeFrequency[i] = (prev ? prev : 0) + (curr ? curr : 0)
		}
	})
	console.log(`Loaded from ${path} successfully!`)
}

// Updates after all refreshes have finished, and not in the middle of doing both together
const updateSuggestion = (): void => {
	suggestion.innerText = currentAdjective + " " + currentNoun
}

// Button listener for copy name button
refreshAdjective.addEventListener("click", (): void => {
	newRandomAdjective()
	updateSuggestion()
	resetButton(refreshName)
})

// Button listener for copy name button
refreshNoun.addEventListener("click", (): void => {
	newRandomNoun()
	updateSuggestion()
	resetButton(refreshName)
})

// Button listener for copy name button
refreshBoth.addEventListener("click", (): void => {
	newRandomName()
	updateSuggestion()
	resetButton(refreshName)
})

loadNameData("../loads/Adjectives.json", adjectives)
loadNameData("../loads/Nouns.json", nouns)
