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

		refreshBoth.click()

		// setTimeout((): void => {
		// 	refreshBoth.click()
		// }, 100) // IDK if delay is actually needed, leaving in case
	} else if ((currentMode = RANDOM)) {
		// Transition to pre-generated names
		// (later will be to custom, then custom -> pre-generated)

		randomGenButtonContainer.style.display = "none"
		refreshName.style.display = "block"
		body.style.backgroundColor = "#d4f9ff"

		refreshName.click()
	} else {
		// To be implemented down the line
	}

	// Move to next mode
	// Change to 3 once custom is implemented
	currentMode = ++currentMode % 2

	resetButton(switchMode)
})
