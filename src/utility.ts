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

// Hidden text for when a name update fails because there aren't any words short enough
const failedUpdate = <HTMLButtonElement>document.getElementById("failedUpdate")

// Custom not currently in use, but will be at some point
const PREGEN = 0,
	RANDOM = 1,
	CUSTOM = 2
let currentMode: number = PREGEN

const updateSuggestion = (): void => {
	let name: string
	if (currentMode === PREGEN)
		name = fixCapitalization(pregenNames.currentWord)
	else if (currentMode === RANDOM)
		name = `${fixCapitalization(
			adjectives.currentWord
		)} ${fixCapitalization(nouns.currentWord)}`

	suggestion.innerHTML = fixCapitalization(name)

	console.log(`Updating suggestion to ${suggestion.innerText}`)
	// If a previous update failed, then we can now hide because this one worked
	failedUpdate.style.display = "none"
}

const newWordFromList = (list: StorageLayout): void => {
	// Pick new name and set new text
	let minInput: string = minCharInput.value,
		maxInput: string = maxCharInput.value
	const numberRegex = /^[0-9]{1,2}$/

	if (!numberRegex.test(minInput)) minInput = list.minLength.toString()
	if (!numberRegex.test(maxInput)) maxInput = list.maxLength.toString()

	// Parse that value into an integer, replacing it if out of bounds with the correct bound
	let minSelection: number = parseInt(minInput)
	let maxSelection: number = parseInt(maxInput)

	// If the names are pre-generated, then our target min/max is just the min/max length string
	// If the names are randomly generated, then we have to consider the min/max combination of adjective + noun
	const compareMin =
		list === pregenNames
			? pregenNames.minLength
			: adjectives.minLength + nouns.minLength
	const compareMax =
		list === pregenNames
			? pregenNames.maxLength
			: adjectives.maxLength + nouns.maxLength

	// Fix minSelection to not exceed either min or max boundaries
	if (minSelection < compareMin) minSelection = compareMin
	if (minSelection > compareMax) minSelection = compareMax

	// Fix maxSelection to not exceed either min or max boundaries
	if (maxSelection < compareMin) maxSelection = compareMin
	if (maxSelection > compareMax) maxSelection = compareMax

	// Fix maxSelection being less than minSelection
	if (maxSelection < minSelection) {
		const temp = maxSelection
		maxSelection = minSelection
		minSelection = temp
	}

	// Resets input values if they were invalid to the closest valid values
	minCharInput.value = minSelection.toString()
	maxCharInput.value = maxSelection.toString()

	console.log(
		`minSelection = ${minSelection}, maxSelection = ${maxSelection}`
	)

	// Minimum possible length of the new thing being generated
	let minPossibleLength: number
	if (list === pregenNames) {
		// Only generating one thing, so it's whatever the maximum possible length is as determined by previous calculations
		minPossibleLength = minSelection
	} else if (list === adjectives || list === nouns) {
		/* 
		If we're generating two things, we don't want to use minSelection because that tells us the minimum of the ENTIRE thing
		Instead, we take the minPossibleLength to be:
			1. If the other word has not been generated, we take the minLength attribute from this list since minSelection is minLength of each list added together. Any word will do.
			2. If the other word HAS been generated, we take the max of either the minLength of the current list or the difference between minSelection (minimum total name length) and the length of the other word.
		*/

		const otherList = list === adjectives ? nouns : adjectives
		if (otherList.currentWordIndex === -1)
			minPossibleLength = list.minLength
		else
			minPossibleLength = Math.max(
				list.minLength,
				minSelection - otherList.currentWord.length
			)
	} // Eventually might implement an operation here for custom names

	// Maximum possible length of the new thing being generated
	let maxPossibleLength: number
	if (list === pregenNames) {
		// Only generating one thing, so it's whatever the maximum possible length is as determined by previous calculations
		maxPossibleLength = maxSelection
	} else if (list === adjectives || list === nouns) {
		// If we're generating two things, make sure that, if the other thing has been generated (not a placeholder),
		// the new thing doesn't bring the total length over maxSelection
		const otherList = list === adjectives ? nouns : adjectives
		if (otherList.currentWordIndex === -1)
			maxPossibleLength = maxSelection - otherList.minLength
		else maxPossibleLength = maxSelection - otherList.currentWord.length

		// The number of remaining characters might or might not be larger than the largest word that this list has
		// If it is too long, shorten maxPossible to the length of longest word in the list
		// That way we aren't running out of bounds
		if (list.cumulativeFreq.length <= maxPossibleLength)
			maxPossibleLength = list.cumulativeFreq.length - 1
	} // Eventually might implement an operation here for custom names

	// The number of words with length less than or equal to maxPossibleLength and more than or equal to minPossibleLength
	const possibleWords: number =
		list.cumulativeFreq[maxPossibleLength] -
		(list.cumulativeFreq[minPossibleLength - 1] // This index may not exist
			? list.cumulativeFreq[minPossibleLength - 1]
			: 0)

	console.log(list)
	console.log(
		`maxPossibleLength = ${maxPossibleLength}\n
		 minPossibleLength = ${minPossibleLength}\n
		 possibleWords = ${possibleWords}`
	)

	// If we don't have any words to pick from, we did something wrong
	if (possibleWords === 0) {
		console.log(
			"No words loaded to pick from. Make the maximum length field larger or regenerate the entire name."
		)
		failedUpdate.style.display = "block"
		return
	}

	const minGen: number = list.cumulativeFreq[minPossibleLength - 1]
		? list.cumulativeFreq[minPossibleLength - 1]
		: 0

	// Generate an index minGen <= index < minGen + range
	let generated: number = Math.floor(Math.random() * possibleWords) + minGen

	// Don't generate the same name two times in a row, unless there are no other names to generate
	if (possibleWords > 1) {
		while (generated === list.currentWordIndex)
			generated = Math.floor(Math.random() * possibleWords) + minGen
	}

	console.log(
		`${possibleWords} possible names between ${minGen}-${
			minGen + possibleWords - 1
		}, generated index ${generated}`
	)

	// Move to the correct outer array index where the name in the full list that corresponds to the generated index lies
	let outerIndex = 0
	while (generated >= list.cumulativeFreq[outerIndex]) outerIndex++

	// Pick the correct name corresponding to the generated index (generated - previous list.cumulativeFreq value) in the array at outerIndex
	const innerIndex: number =
		generated -
		(list.cumulativeFreq[outerIndex - 1]
			? list.cumulativeFreq[outerIndex - 1]
			: 0)

	// Pick the name and update suggestion text
	const newWord: string = list.fullList[outerIndex][innerIndex]
	console.log(`Changed ${list.currentWord} -> ${newWord}`)
	list.currentWord = newWord
	list.currentWordIndex = generated
	updateSuggestion()
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

const updateForPregen = (): void => {
	// Transition to pre-generated names
	// (later will be to custom, then custom -> pre-generated)

	console.log("Updated for pregen")
	randomGenButtonContainer.style.display = "none"
	refreshName.style.display = "block"
	body.style.backgroundColor = "#d4f9ff"
	switchMode.innerHTML = "Generate Randomly"
	console.log(
		`Updating min/max inputs to ${pregenNames.minLength} -> ${pregenNames.maxLength}`
	)
	minCharInput.value = pregenNames.minLength.toString()
	maxCharInput.value = pregenNames.maxLength.toString()

	newWordFromList(pregenNames)
}

const updateForRandom = (): void => {
	// Transition to randomly generated names

	console.log("Updated for random")
	randomGenButtonContainer.style.display = "block"
	refreshName.style.display = "none"
	body.style.backgroundColor = "#eadaff"
	switchMode.innerHTML = "Use Pre-generated"
	console.log(
		`Updating min/max inputs to ${
			adjectives.minLength + nouns.minLength
		} -> ${adjectives.maxLength + nouns.maxLength}`
	)
	minCharInput.value = (adjectives.minLength + nouns.minLength).toString()
	maxCharInput.value = (adjectives.maxLength + nouns.maxLength).toString()

	newFullName()
}

// Button listener for copy name button
switchMode.addEventListener("click", function (): void {
	// Move to next mode
	// Change to 3 once custom is implemented
	currentMode = ++currentMode % 2
	console.log("newMode = " + currentMode)

	if (currentMode === RANDOM) updateForRandom()
	// Transition to randomly generated names
	else if (currentMode === PREGEN) updateForPregen()
	// else if(currentMode === CUSTOM) ...

	// Update our current mode in settings so that the next time we open a popup it defaults to that mode
	chrome.storage.sync.set({ defaultMode: currentMode })
	resetButton(switchMode)
})

const fixCapitalization = (str: string): string => {
	return str
		.split(" ")
		.map((each) => capitalizeWord(each))
		.join(" ")
}

const capitalizeWord = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Executes when the popup is first generated
chrome.storage.sync.get(["defaultMode"], async (result): Promise<void> => {
	await loadNameData("../loads/Adjectives.json", adjectives)
	await loadNameData("../loads/Nouns.json", nouns)
	await loadPregenNameData()

	console.log("Finished loading default mode")

	console.log(result)

	//If we don't have a valid option for result.defaultMode then
	currentMode = result.defaultMode !== undefined ? result.defaultMode : PREGEN
	if (currentMode === RANDOM) updateForRandom()
	else if (currentMode === PREGEN) updateForPregen()

	console.log("Finished setting up for mode " + currentMode)
})
