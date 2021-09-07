let currentAdjective: string, currentNoun: string;
let minAdjectiveLength: number, maxAdjectiveLength: number;
let minNounLength: number, maxNounLength: number

const allAdjectives: string[][] = [[]]
const allNouns: string[][] = [[]]

const nounCumFreq: number[] = []
const adjectiveCumFreq: number[] = []

const newRandomName = (): void => {
}

const newRandomAdjective = (): void => {

}

const newRandomNoun = (): void => {

}

// Get all adjectives and nouns from JSON files
const loadNounAdjectiveData = async (): Promise<void> => {
    // TODO
	const adjectivesResponse: Response | void = await fetch(
		"../loads/Adjectives.json"
	).catch(function (error) {
		console.log("Fetch Error :-S", error)
		return
	})

    const nounsResponse: Response | void = await fetch(
		"../loads/Adjectives.json"
	).catch(function (error) {
		console.log("Fetch Error :-S", error)
		return
	})

    // Error check responses
	if (!adjectivesResponse) {
		console.log("Looks like there was a problem - Adjectives request response is void")
		return
	}

	if (adjectivesResponse.status !== 200) {
		console.log(
			"Looks like there was a problem. Adjective Request Status Code: " +
				(adjectivesResponse ? adjectivesResponse.status : "N/A")
		)
		return
	}

	if (!nounsResponse) {
		console.log("Looks like there was a problem - Nouns request response is void")
		return
	}

	if (nounsResponse.status !== 200) {
		console.log(
			"Looks like there was a problem. Noun Request Status Code: " +
				(nounsResponse ? nounsResponse.status : "N/A")
		)
		return
	}

	adjectivesResponse.json().then((data): void => {
		const loadedNames: string[] = data.allNames

        //TODO
	})
    
	nounsResponse.json().then((data): void => {
		const loadedNames: string[] = data.allNames

		//TODO
	})
	console.log("Finished load")
}

// Button listener for copy name button
refreshAdjective.addEventListener("click", (): void => {
    newRandomAdjective()
	resetButton(refreshName)
})

// Button listener for copy name button
refreshNoun.addEventListener("click", (): void => {
    newRandomNoun()
	resetButton(refreshName)
})

// Button listener for copy name button
refreshBoth.addEventListener("click", (): void => {
    newRandomName()
	resetButton(refreshName)
})

loadNounAdjectiveData() // Call that function to load the band names

/*
Generation planning:
- Each list gets loaded when the popup or popup is created, nouns and adjectives, to their own arrays
    - Sort by length of the word
- HTML should have a place for the name generated
- Should be able to generated entirely new names, or the noun/adjective individually
- Also needs a maximum length field

- When generating both: Pick a noun at random, then adjective
    - Noun should be no longer than (maxCharCount - minAdjectiveLength)
    - Adjective should be chosen randomly from those no longer than (maxCharCount - chosenNounLength)
- If regenerating either part or both, the next option should not contain either the same noun or adjective unless there is no other option for one or the either.
*/