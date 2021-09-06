// Get body tag, suggestion text/header, and copy/refresh buttons
let suggestionHeader = document.getElementById("suggestionHeader")
let suggestion = document.getElementById("suggestion")

let copyName: HTMLButtonElement = <HTMLButtonElement>(
	document.getElementById("copyName")
)
let refreshName = <HTMLButtonElement>document.getElementById("refreshName")
let switchMode: HTMLButtonElement = <HTMLButtonElement>(
	document.getElementById("switchMode")
)

let maxCharInput = <HTMLInputElement>document.getElementById("maxCharInput")
let minCharInput = <HTMLInputElement>document.getElementById("minCharInput")
let body = document.getElementsByTagName("body")[0]

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
	let copyFrom: HTMLTextAreaElement = document.createElement("textarea")

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
	// TODO: Make stylistic changes depending on current mode and reshuffle listeners and such

	resetButton(switchMode)
})
