interface StorageLayout {
	type: string;
	fullList: string[][];
	cumulativeFreq: number[];
	minLength: number;
	maxLength: number;
	currentWord: string;
	currentWordIndex: number;
	prevWordIndex: number;
}

const adjectives: StorageLayout = {
	type: 'adjectives',
	fullList: [],
	cumulativeFreq: [],
	minLength: Number.MAX_SAFE_INTEGER,
	maxLength: -1,
	currentWord: 'TEMP',
	currentWordIndex: -1,
	prevWordIndex: -1,
};

const nouns: StorageLayout = {
	type: 'nouns',
	fullList: [],
	cumulativeFreq: [],
	minLength: Number.MAX_SAFE_INTEGER,
	maxLength: -1,
	currentWord: 'TEMP',
	currentWordIndex: -1,
	prevWordIndex: -1,
};

let pregenNames: StorageLayout = {
	type: 'pre-generated',
	fullList: [],
	cumulativeFreq: [],
	minLength: Number.MAX_SAFE_INTEGER,
	maxLength: -1,
	currentWord: 'PLACEHOLDER',
	currentWordIndex: -1,
	prevWordIndex: -1,
};

const newFullName = (): void => {
	// Set current indices to placeholders and generate both
	adjectives.prevWordIndex = adjectives.currentWordIndex;
	adjectives.currentWordIndex = -1;
	nouns.prevWordIndex = nouns.currentWordIndex;
	nouns.currentWordIndex = -1;
	newRandomAdjective();
	newRandomNoun();
};

const newRandomAdjective = (): void => {
	if (adjectives.fullList.length === 0) {
		console.log(
			'No adjectives loaded due to an error, cannot generate a new name'
		);
		return;
	}
	newWordFromList(adjectives);
};

const newRandomNoun = (): void => {
	if (nouns.fullList.length === 0) {
		console.log(
			'No adjectives loaded due to an error, cannot generate a new name'
		);
		return;
	}
	newWordFromList(nouns);
};

type LoadedData = {
	allWords?: string[];
	allNames?: string[];
};

// Get all adjectives and nouns from JSON files
const loadNameData = async (
	path: string,
	destination: StorageLayout
): Promise<void> => {
	let loaded: string[] = [];
	try {
		const response = await fetch(path);
		if (!response.ok) {
			throw Error(response.statusText);
		}
		let data: LoadedData = await response.json();
		loaded = data.allNames ?? data.allWords!;
	} catch (error) {
		console.error(`Error fetching ${path}: ${error}`);
		return;
	}

	const fullList: string[][] = destination.fullList;
	const cumulativeFrequency: number[] = destination.cumulativeFreq;

	for (let current of loaded) {
		const len = current.replace(/ /g, '').length;

		destination.minLength = Math.min(destination.minLength, len);
		destination.maxLength = Math.max(destination.maxLength, len);

		// Push any required new arrays onto the end so that we have
		// an array at the required index
		while (!fullList[len]) fullList.push([]);
		fullList[len].push(current);

		// Update the freq for this length
		// Will be undefined if first name of that length
		const curFreq: number = cumulativeFrequency[len];
		cumulativeFrequency[len] = 1 + (curFreq ?? 0);
	}

	// Move through cumulativeFreq and add previous slot so that
	// our array holds how many names are the length of the index or shorter
	for (let i = 0; i < cumulativeFrequency.length; i++) {
		const prev: number = cumulativeFrequency[i - 1];
		const curr: number = cumulativeFrequency[i];
		cumulativeFrequency[i] = (prev ?? 0) + (curr ?? 0);
	}

	console.log(`Loaded from ${path} successfully!`);
};

refreshAdjective.addEventListener('click', (): void => {
	newRandomAdjective();
	resetButton(refreshName);
});

refreshNoun.addEventListener('click', (): void => {
	newRandomNoun();
	resetButton(refreshName);
});

refreshBoth.addEventListener('click', (): void => {
	newFullName();
	resetButton(refreshName);
});

refreshName.addEventListener('click', (): void => {
	// Generate new band name for the popup
	newWordFromList(pregenNames);
	resetButton(refreshName);
});
