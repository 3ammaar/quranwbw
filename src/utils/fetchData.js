import { get } from 'svelte/store';
import { __fontType, __chapterData, __verseTranslationData, __wordTranslation, __wordTransliteration, __verseTranslations, __timestampData } from '$utils/stores';
import { apiEndpoint, staticEndpoint, apiVersion } from '$data/websiteSettings';
import { selectableFontTypes } from '$data/options';

// we first fetch specific verses (startVerse to endVerse), and then fetch the complete chapter data which will then be cached by the user's browser
export async function fetchChapterData(chapter, download = false) {
	__chapterData.set(null);
	const fontType = get(__fontType);
	const wordTranslation = get(__wordTranslation);
	const wordTransliteration = get(__wordTransliteration);

	let apiURL =
		`${apiEndpoint}/chapter?` +
		new URLSearchParams({
			chapter: chapter,
			word_type: selectableFontTypes[fontType].apiId,
			word_translation: wordTranslation,
			word_transliteration: wordTransliteration,
			verse_translation: '1,3',
			version: apiVersion
		});

	// if the user is on the chapter page, fetch and set the data in store
	const response = await fetch(apiURL);
	const data = await response.json();

	// download = true means that we are just fetching api data without updating the __chapterData store (for downloadData)
	if (!download) __chapterData.set(data.data.verses);
	// if only the partial data was requested, load the complete data too
	else fetchChapterData(chapter);
}

// function to get verse translations from Quran.com's API, this is a seperate request as compared to the rest of verse data (from our API)
export async function fetchVerseTranslationData(chapter) {
	__verseTranslationData.set(null);
	const apiURL =
		`https://api.qurancdn.com/api/qdc/verses/by_chapter/${chapter}?` +
		new URLSearchParams({
			per_page: 286,
			translations: get(__verseTranslations).toString()
		});

	const response = await fetch(apiURL);
	const data = await response.json();
	__verseTranslationData.set(data.verses);
	return data.verses;
}

// function to fetch individual verses
export async function fetchVersesData(verses, fontType, wordTranslation) {
	__chapterData.set(null);

	const apiURL =
		`${apiEndpoint}/verses?` +
		new URLSearchParams({
			verses: verses,
			word_type: selectableFontTypes[fontType].apiId,
			word_translation: wordTranslation,
			word_transliteration: get(__wordTransliteration),
			verse_translation: '1,3',
			version: apiVersion
		});

	const response = await fetch(apiURL);
	const data = await response.json();
	// if (!skipStore) __chapterData.set(data.data.verses);
	__chapterData.set(data.data.verses);
	return data.data.verses;
}

// function to fetch single verses
export async function fetchSingleVerseData(verses, fontType) {
	const apiURL =
		`${apiEndpoint}/verses?` +
		new URLSearchParams({
			verses: verses,
			word_type: selectableFontTypes[fontType].apiId,
			version: apiVersion
		});

	const response = await fetch(apiURL);
	const data = await response.json();
	return data.data.verses;
}

// function to fetch timestamps for wbw highlighting
export async function fetchTimestampData(chapter) {
	const apiURL = `${staticEndpoint}/v4/timestamps/${chapter}.json?version=1`;
	const response = await fetch(apiURL);
	const data = await response.json();
	__timestampData.set(data);
}
