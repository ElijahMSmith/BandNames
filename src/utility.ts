interface StorageLayout {
	fullList: string[][]
	cumulativeFreq: number[]
	minLength: number
	maxLength: number
	currentWord: string
	currentWordIndex: number
}

// Tag imports
const suggestionHeader = document.getElementById("suggestionHeader")
const suggestion = document.getElementById("suggestion")

const copyName: HTMLButtonElement = <HTMLButtonElement>(
	document.getElementById("copyName")
)
const switchMode: HTMLButtonElement = <HTMLButtonElement>(
	document.getElementById("switchMode")
)

// Conditional buttons depending on active page
const refreshName = <HTMLButtonElement>document.getElementById("refreshName")
const randomGenButtonContainer: HTMLElement = document.getElementById(
	"randomGenButtonContainer"
)
const refreshAdjective = <HTMLButtonElement>(
	document.getElementById("refreshAdjective")
)
const refreshNoun = <HTMLButtonElement>document.getElementById("refreshNoun")
const refreshBoth = <HTMLButtonElement>document.getElementById("refreshBoth")

// Character inputs
const maxCharInput = <HTMLInputElement>document.getElementById("maxCharInput")
const minCharInput = <HTMLInputElement>document.getElementById("minCharInput")
const body = document.getElementsByTagName("body")[0]

// Custom not currently in use, but will be at some point
const PREGEN = 0,
	RANDOM = 1,
	CUSTOM = 2
let currentMode: number = PREGEN

const updateSuggestion = (): void => {
	let name: string;
	if(currentMode === PREGEN)
		name = fixCapitalization(pregenNames.currentWord)
	else if(currentMode === RANDOM)
		name = `${fixCapitalization(nouns.currentWord)} ${fixCapitalization(adjectives.currentWord)}`

	suggestion.innerHTML = fixCapitalization(name)

	console.log(`Updating suggestion to ${suggestion.innerText}`)
}

const newWordFromList = (obj: StorageLayout): void => {
	// Pick new name and set new text
	let maxInput: string = maxCharInput.value,
		minInput: string = minCharInput.value
	const numberRegex = /^[0-9]{1,2}$/

	if (!numberRegex.test(maxInput)) maxInput = obj.maxLength.toString()
	if (!numberRegex.test(minInput)) minInput = obj.minLength.toString()

	// Parse that value into an integer, replacing it if out of bounds with the correct bound
	let maxSelection: number = parseInt(maxInput)
	let minSelection: number = parseInt(minInput)

	// Fix maxSelection to not exceed either min or max boundaries
	if (maxSelection < obj.minLength) maxSelection = obj.minLength
	if (maxSelection > obj.maxLength) maxSelection = obj.maxLength

	// Fix minSelection to not exceed either min or max boundaries
	if (minSelection < obj.minLength) minSelection = obj.minLength
	if (minSelection > obj.maxLength) minSelection = obj.maxLength

	// Fix maxSelection being less than minSelection
	if (maxSelection < minSelection) {
		const temp = maxSelection
		maxSelection = minSelection
		minSelection = temp
	}

	minCharInput.value = minSelection.toString()
	maxCharInput.value = maxSelection.toString()

	// The number of words with length less than or equal to maxSelection and more than or equal to minSelection
	const possibleWords: number =
		obj.cumulativeFreq[maxSelection] -
		(obj.cumulativeFreq[minSelection - 1]
			? obj.cumulativeFreq[minSelection - 1]
			: 0)

	// If we don't have any names to pick from, we did something wrong
	if (possibleWords === 0) {
		console.error("ERROR: No words loaded to pick from")
		return
	}

	const minGen: number = obj.cumulativeFreq[minSelection - 1]
		? obj.cumulativeFreq[minSelection - 1]
		: 0

	// Generate an index minGen <= index < minGen + range
	let generated: number = Math.floor(Math.random() * possibleWords) + minGen

	// Don't generate the same name two times in a row, unless there are no other names to generate
	if (possibleWords > 1) {
		while (generated === obj.currentWordIndex)
			generated = Math.floor(Math.random() * possibleWords) + minGen
	}

	console.log(
		`${possibleWords} possible names between ${minGen}-${
			minGen + possibleWords - 1
		}, generated index ${generated}`
	)

	// Move to the correct outer array index where the name in the full list that corresponds to the generated index lies
	let outerIndex = 0
	while (generated >= obj.cumulativeFreq[outerIndex]) outerIndex++

	// Pick the correct name corresponding to the generated index (generated - previous obj.cumulativeFreq value) in the array at outerIndex
	const innerIndex: number =
		generated -
		(obj.cumulativeFreq[outerIndex - 1]
			? obj.cumulativeFreq[outerIndex - 1]
			: 0)

	// Pick the name and update suggestion text
	const newWord: string = obj.fullList[outerIndex][innerIndex]
	console.log(`Changed ${obj.currentWord} -> ${newWord}`)
	obj.currentWord = newWord
	obj.currentWordIndex = generated
}

// Briefly changes button color to indicate that it actually pressed
const resetButton = (button: HTMLButtonElement): void => {
	// Show button has been clicked by changing appearance slightly
	button.style.backgroundColor = "#ff3340"

	// After brief delay, reset button to default style
	setTimeout((): void => {
		button.style.backgroundColor = "#ff737c"
	}, 100)
}

// Copies text input (suggested band name) to clipboard
const copyTextToClipboard = (text: string): void => {
	// Create a text box field where we can insert text to.
	const copyFrom: HTMLTextAreaElement = document.createElement("textarea")

	// Set the text content to be the text you wished to copy.
	copyFrom.textContent = text

	// Append the text area field into the body as a child.
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

// Button listener for copy name button
copyName.addEventListener("click", function (): void {
	// Copy band name to clipboard
	copyTextToClipboard(suggestion.innerHTML)

	resetButton(copyName)
})

// Button listener for copy name button
switchMode.addEventListener("click", function (): void {
	if (currentMode === PREGEN) {
		// Transition to randomly generated names

		randomGenButtonContainer.style.display = "block"
		refreshName.style.display = "none"
		body.style.backgroundColor = "#eadaff"

		newFullName()
	} else if (currentMode === RANDOM) {
		// Transition to pre-generated names
		// (later will be to custom, then custom -> pre-generated)

		randomGenButtonContainer.style.display = "none"
		refreshName.style.display = "block"
		body.style.backgroundColor = "#d4f9ff"

		newWordFromList(pregenNames)
	} else {
		// To be implemented down the line
	}

	// Move to next mode
	// Change to 3 once custom is implemented
	currentMode = ++currentMode % 2

	resetButton(switchMode)
})

const fixCapitalization = (str: string): string => {
	//TODO: Split at spaces, map back together where first letter of every word is capitalized
	return str.split(" ").map(each => capitalizeWord(each)).join(" ")
}

const capitalizeWord = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}