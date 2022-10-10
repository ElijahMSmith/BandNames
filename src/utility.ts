// Tag imports
const suggestionHeader: HTMLElement =
	document.getElementById('suggestionHeader');
const suggestion: HTMLElement = document.getElementById('suggestion');

// Buttons on all modes
const copyName = <HTMLButtonElement>document.getElementById('copyName');
const switchMode = <HTMLButtonElement>document.getElementById('switchMode');

// Conditional elements depending on active page
const randomGenButtonContainer: HTMLElement = document.getElementById(
	'randomGenButtonContainer'
);
const refreshName = <HTMLButtonElement>document.getElementById('refreshName');
const refreshAdjective = <HTMLButtonElement>(
	document.getElementById('refreshAdjective')
);
const refreshNoun = <HTMLButtonElement>document.getElementById('refreshNoun');
const refreshBoth = <HTMLButtonElement>document.getElementById('refreshBoth');

// Character inputs
const maxCharInput: HTMLInputElement = <HTMLInputElement>(
	document.getElementById('maxCharInput')
);
const minCharInput: HTMLInputElement = <HTMLInputElement>(
	document.getElementById('minCharInput')
);

// Hidden text for when a name update fails because there aren't any words short enough
const failedUpdate: HTMLElement = document.getElementById('failedUpdate');
const body: HTMLElement = document.getElementsByTagName('body')[0];

// Custom not currently in use, but will be at some point
const PREGEN = 0,
	RANDOM = 1,
	CUSTOM = 2;
let currentMode: number = PREGEN;

const updateSuggestion = (): void => {
	console.log('Current Mode: ' + currentMode);

	let name: string;
	if (currentMode === PREGEN)
		name = fixCapitalization(pregenNames.currentWord);
	else if (currentMode === RANDOM)
		name = `${fixCapitalization(
			adjectives.currentWord
		)} ${fixCapitalization(nouns.currentWord)}`;

	suggestion.innerText = fixCapitalization(name);

	console.log(`Updating suggestion to ${suggestion.innerText}`);
	// If a previous update failed, then we can now hide because this one worked
	failedUpdate.style.display = 'none';
};

const newWordFromList = (list: StorageLayout): void => {
	// Pick new name and set new text
	let minInput: string = minCharInput.value,
		maxInput: string = maxCharInput.value;
	const numberRegex = /^[0-9]{1,2}$/;

	// Begin sanitizing min/max input values
	if (!numberRegex.test(minInput)) minInput = list.minLength.toString();
	if (!numberRegex.test(maxInput)) maxInput = list.maxLength.toString();

	// Parse that value into an integer, replacing it if out of bounds with the correct bound
	let minSelection: number = parseInt(minInput);
	let maxSelection: number = parseInt(maxInput);

	// Get combined min/max (adjective + noun for random, pregenNames for pregen)
	const compareMin =
		list === pregenNames
			? pregenNames.minLength
			: adjectives.minLength + nouns.minLength;
	const compareMax =
		list === pregenNames
			? pregenNames.maxLength
			: adjectives.maxLength + nouns.maxLength;

	// Fix minSelection to not exceed either min or max boundaries
	if (minSelection < compareMin) minSelection = compareMin;
	if (minSelection > compareMax) minSelection = compareMax;

	// Fix maxSelection to not exceed either min or max boundaries
	if (maxSelection < compareMin) maxSelection = compareMin;
	if (maxSelection > compareMax) maxSelection = compareMax;

	// Fix maxSelection being less than minSelection
	if (maxSelection < minSelection) {
		const temp = maxSelection;
		maxSelection = minSelection;
		minSelection = temp;
	}

	// Reset input values if min/max were updated
	minCharInput.value = minSelection.toString();
	maxCharInput.value = maxSelection.toString();

	console.log(
		`minSelection = ${minSelection}, maxSelection = ${maxSelection}`
	);

	/*

    Length constraints on generating a random noun/adjective

    Parameters:

    minWordLength = smallest word in this list
    maxWordLength = longest word in this list

    minOtherList = smallest word in other list
    maxOtherList = longest word in other list
    otherLength = exact length of other word

    minParam = minimum total generation length
    maxParam = maximum total generation length

    Random gen:

    If other list ISN'T generated,
        Math.max(minParam - maxOtherList, minWordLength) -> Math.min(maxParam - minOtherList, maxWordLength)
    If other list IS generated,
        Math.max(minParam - otherLength, minWordLength) -> Math.min(maxParam - otherLength, maxWordLength)


    Ex:

    CASE 1
    Noun: 5 -> 22
    Adjective: 13 -> 24

    minParam = 18
    maxParam = 46

    Noun:
    gen = Math.max(18 - 24, 5) -> Math.min(46 - 13, 22) = 5 -> 22
    Choose 22

    Adjective:
    gen = Math.max(18 - 22, 13) -> Math.min(46 - 22, 24) = 13 -> 24

    --------------------------------------

    CASE 2:
    Noun: 5 -> 22
    Adjective: 13 -> 24

    minParam = 24
    maxParam = 28

    Noun:
    gen = Math.max(24 - 24, 5) -> Math.min(28 - 13, 22) = 5 -> 15
    Choose 7

    Adjective:
    gen = Math.max(24 - 7, 13) -> Math.min(28 - 7, 24) = 17 -> 21

    --------------------------------------

    CASE 3:
    Noun: 7 -> 22
    Adjective: 5 -> 8

    minParam = 17
    maxParam = 22

    Noun:
    gen = Math.max(17 - 8, 7) -> Math.min(22 - 5, 22) = 9 -> 17
    Choose 9

    Adjective:
    gen = Math.max(17 - 9, 5) -> Math.min(22 - 9, 8) = 8 -> 8

    */

	// Minimum possible length of the new thing being generated
	let minPossibleLength: number;
	if (list === pregenNames) {
		// Only generating one thing, so min length stays the same
		minPossibleLength = minSelection;
	} else if (list === adjectives || list === nouns) {
		// Generating one of two things
		const otherList = list === adjectives ? nouns : adjectives;

		// Other word not generated, we can generate almost anything from this list
		minPossibleLength = Math.max(
			minSelection -
				(otherList.currentWordIndex === -1
					? otherList.maxLength
					: otherList.currentWord.length),
			list.minLength
		);
	} // Eventually might implement an operation here for custom names

	// Maximum possible length of the new thing being generated
	let maxPossibleLength: number;
	if (list === pregenNames) {
		// Only generating one thing, so max length stays the same
		maxPossibleLength = maxSelection;
	} else if (list === adjectives || list === nouns) {
		// Generating one of two things
		const otherList = list === adjectives ? nouns : adjectives;

		// Other word not generated, we can generate almost anything from this list
		maxPossibleLength = Math.min(
			maxSelection -
				(otherList.currentWordIndex === -1
					? otherList.minLength
					: otherList.currentWord.length),
			list.maxLength
		);
	} // Eventually might implement an operation here for custom names

	// The number of words with length less than or equal to maxPossibleLength
	// and more than or equal to minPossibleLength
	const possibleWords: number =
		list.cumulativeFreq[maxPossibleLength] -
		(list.cumulativeFreq[minPossibleLength - 1] ?? 0);

	console.log(list);
	console.log(
		`maxPossibleLength = ${maxPossibleLength}\nminPossibleLength = ${minPossibleLength}\npossibleWords = ${
			minPossibleLength > maxPossibleLength ? 0 : possibleWords
		}`
	);

	// If we don't have any words to pick from, we did something wrong
	if (possibleWords <= 0 || minPossibleLength > maxPossibleLength) {
		console.log(
			'No words loaded to pick from. Make the maximum length field larger or regenerate the entire name.'
		);
		failedUpdate.style.display = 'block';
		return;
	}

	const minGen: number = list.cumulativeFreq[minPossibleLength - 1] ?? 0;

	// Generate an index minGen <= index < minGen + range
	// Don't generate the same name two times in a row, unless there are no other names to generate
	let generated: number;
	do {
		generated = Math.floor(Math.random() * possibleWords) + minGen;
	} while (
		possibleWords > 1 &&
		(generated === list.currentWordIndex ||
			generated === list.prevWordIndex)
	);

	console.log(
		`${possibleWords} possible names between ${minGen}-${
			minGen + possibleWords - 1
		}, generated index ${generated}`
	);

	// Move to the correct outer array index where the name in the full list that corresponds to the generated index lies
	let outerIndex = 0;
	while (generated >= list.cumulativeFreq[outerIndex]) outerIndex++;

	// Pick the correct name corresponding to the generated index (generated - previous list.cumulativeFreq value) in the array at outerIndex
	const innerIndex: number =
		generated - (list.cumulativeFreq[outerIndex - 1] ?? 0);

	// Pick the name and update suggestion text
	const newWord: string = list.fullList[outerIndex][innerIndex];
	console.log(`Changed ${list.currentWord} -> ${newWord}`);
	list.currentWord = newWord;
	list.currentWordIndex = generated;

	updateSuggestion();
};

// Briefly changes button color to indicate that it actually pressed
const resetButton = (button: HTMLButtonElement): void => {
	// Show button has been clicked by changing appearance slightly
	button.style.backgroundColor = '#ff3340';

	// After brief delay, reset button to default style
	setTimeout((): void => {
		button.style.backgroundColor = '#ff737c';
	}, 100);
};

// Copies text input (suggested band name) to clipboard
const copyTextToClipboard = (text: string): void => {
	// Creates a temporary text box to copy from
	const copyFrom: HTMLTextAreaElement = document.createElement('textarea');
	copyFrom.textContent = text;
	document.body.appendChild(copyFrom);

	// Copy text, deselect box (blur), the remove
	copyFrom.select();
	document.execCommand('copy');
	copyFrom.blur();
	document.body.removeChild(copyFrom);
};

// Button listener for copy name button
copyName.addEventListener('click', function (): void {
	copyTextToClipboard(suggestion.innerHTML);
	resetButton(copyName);
});

// Update popup by showing pregen elements and hiding randomgen elements
const updateForPregen = (): void => {
	// (later will be to custom, then custom -> pre-generated)

	console.log('Updated for pregen');
	randomGenButtonContainer.style.display = 'none';
	refreshName.style.display = 'block';
	body.style.backgroundColor = '#d4f9ff';
	switchMode.innerHTML = 'Generate Randomly';
	console.log(
		`Updating min/max inputs to ${pregenNames.minLength} -> ${pregenNames.maxLength}`
	);
	minCharInput.value = pregenNames.minLength.toString();
	maxCharInput.value = pregenNames.maxLength.toString();

	newWordFromList(pregenNames);
};

// Update popup by showing randomgen elements and hiding pregen elements
const updateForRandom = (): void => {
	console.log('Updated for random');
	randomGenButtonContainer.style.display = 'block';
	refreshName.style.display = 'none';
	body.style.backgroundColor = '#eadaff';
	switchMode.innerHTML = 'Use Pre-generated';
	console.log(
		`Updating min/max inputs to ${
			adjectives.minLength + nouns.minLength
		} -> ${adjectives.maxLength + nouns.maxLength}`
	);
	minCharInput.value = (adjectives.minLength + nouns.minLength).toString();
	maxCharInput.value = (adjectives.maxLength + nouns.maxLength).toString();

	newFullName();
};

// Button listener for switching generation modes
switchMode.addEventListener('click', function (): void {
	// Change below to 3 if custom names implemented
	currentMode = ++currentMode % 2;
	console.log('newMode = ' + currentMode);

	if (currentMode === RANDOM) updateForRandom();
	else if (currentMode === PREGEN) updateForPregen();
	// else if(currentMode === CUSTOM) ...

	// Update our current mode in settings so that the next time we
	// open a popup it defaults to that mode
	chrome.storage.sync.set({ defaultMode: currentMode });
	resetButton(switchMode);
});

// Capitalize the first letter only of each word in a string
const fixCapitalization = (str: string): string => {
	return str
		.split(' ')
		.map((each) => capitalizeWord(each))
		.join(' ');
};

// Individually capitalize a single word string
const capitalizeWord = (str: string): string => {
	let found = false;
	let newStr = '';
	for (let i = 0; i < str.length; i++) {
		let c = str.charAt(i);
		if (
			(!found || (i != 0 && str.charAt(i - 1) == '-')) &&
			charIsLetter(str.charAt(i))
		) {
			found = true;
			newStr += c.toUpperCase();
		} else {
			newStr += c;
		}
	}
	return newStr;
};

const charIsLetter = (char) => {
	if (typeof char !== 'string') return false;

	return /^[a-zA-Z]{1}$/.test(char);
};

// Executes when the popup is first generated
chrome.storage.sync.get(
	{ defaultMode: PREGEN },
	async (result): Promise<void> => {
		await loadNameData('../loads/Adjectives.json', adjectives);
		await loadNameData('../loads/Nouns.json', nouns);
		await loadNameData('../loads/PreGenerated.json', pregenNames);

		console.log('Finished loading default mode ' + result.defaultMode);
		currentMode = result.defaultMode;

		if (result.defaultMode === RANDOM) updateForRandom();
		else if (result.defaultMode === PREGEN) updateForPregen();

		console.log('Finished setting up for mode ' + result.defaultMode);
	}
);
