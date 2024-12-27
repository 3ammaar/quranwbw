import { db } from '$utils/dexieDB';
import { initialiseUserSettingsStores } from './utils/stores';
import { pb } from '$utils/pocketBaseDB';
import { __pbAuth } from '$utils/stores';

(async function () {
	await setUserSettings();
	authSubscribe();
})();

function authSubscribe() {
	pb.collection("users").subscribe("*", () => {
		if (pb.authStore.isValid) pb.collection("users").authRefresh()
			.catch(error => {
				if (error.status == 401) {
					pb.authStore.clear();
				}
			});
		__pbAuth.set(pb.authStore);
	});

	window.onbeforeunload = () => {pb.collection("users").unsubscribe()};
}

async function moveUserSettingsFromLocalStorageToDB() {
	let userSettings = JSON.parse(localStorage.getItem('userSettings'));
	if (!userSettings) return;
	const now = new Date();

	// Display settings
	if (userSettings.displaySettings) {
		if (userSettings.displaySettings.websiteTheme != null) await db.userSettings.put(
			{name: "displaySettings.websiteTheme", value: userSettings.displaySettings.websiteTheme, last_updated: now}
		);

		if (userSettings.displaySettings.displayType != null) await db.userSettings.put(
			{name: "displaySettings.displayType", value: userSettings.displaySettings.displayType, last_updated: now}
		);

		if (userSettings.displaySettings.fontType != null) await db.userSettings.put(
			{name: "displaySettings.fontType", value: userSettings.displaySettings.fontType, last_updated: now}
		);
		
		if (userSettings.displaySettings.wordTranslationEnabled != null) await db.userSettings.put(
			{name: "displaySettings.wordTranslationEnabled", value: userSettings.displaySettings.wordTranslationEnabled, last_updated: now}
		);

		if (userSettings.displaySettings.wordTransliterationEnabled != null) await db.userSettings.put(
			{name: "displaySettings.wordTransliterationEnabled", value: userSettings.displaySettings.wordTransliterationEnabled, last_updated: now}
		);

		if (userSettings.displaySettings.wordTooltip != null) await db.userSettings.put(
			{name: "displaySettings.wordTooltip", value: userSettings.displaySettings.wordTooltip, last_updated: now}
		);

		if (userSettings.displaySettings.autoScrollSpeed != null) await db.userSettings.put(
			{name: "displaySettings.autoScrollSpeed", value: userSettings.displaySettings.autoScrollSpeed, last_updated: now}
		);

		if (userSettings.displaySettings.wakeLockEnabled != null) await db.userSettings.put(
			{name: "displaySettings.wakeLockEnabled", value: userSettings.displaySettings.wakeLockEnabled, last_updated: now}
		);

		if (userSettings.displaySettings.englishTerminology != null) await db.userSettings.put(
			{name: "displaySettings.englishTerminology", value: userSettings.displaySettings.englishTerminology, last_updated: now}
		);

		if (userSettings.displaySettings.hideNonDuaPart != null) await db.userSettings.put(
			{name: "displaySettings.hideNonDuaPart", value: userSettings.displaySettings.hideNonDuaPart, last_updated: now}
		);

		// Font size settings (child of display settings)
		if (!userSettings.displaySettings.fontSizes) {

			if (userSettings.displaySettings.fontSizes.arabicText != null) await db.userSettings.put(
				{name: "displaySettings.fontSizes.arabicText", value: userSettings.displaySettings.fontSizes.arabicText, last_updated: now}
			);

			if (userSettings.displaySettings.fontSizes.wordTranslationText != null) await db.userSettings.put(
				{name: "displaySettings.fontSizes.wordTranslationText", value: userSettings.displaySettings.fontSizes.wordTranslationText, last_updated: now}
			);

			if (userSettings.displaySettings.fontSizes.verseTranslationText != null) await db.userSettings.put(
				{name: "displaySettings.fontSizes.verseTranslationText", value: userSettings.displaySettings.fontSizes.verseTranslationText, last_updated: now}
			);
		}
	}

	// Translation settings
	if (userSettings.translations) {
		if (userSettings.translations.word != null) await db.userSettings.put(
			{name: "translations.word", value: userSettings.translations.word, last_updated: now}
		);

		if (userSettings.translations.verse_v1 != null) await db.userVerseTranslationsSettings.bulkPut(
			userSettings.translations.verse_v1
				.map((translation) => ({name: translation, enabled: 1, last_updated: now}))
		);

		if (userSettings.translations.tafsir != null) await db.userSettings.put(
			{name: "translations.tafsir", value: userSettings.translations.tafsir, last_updated: now}
		);
	}

	// Transliteration settings
	if (userSettings.transliteration) {
		if (userSettings.transliteration.word != null) await db.userSettings.put(
			{name: "transliteration.word", value: userSettings.transliteration.word, last_updated: now}
		);
	}

	// Audio settings
	if (userSettings.audioSettings) {
		if (userSettings.audioSettings.reciter != null) await db.userSettings.put(
			{name: "audioSettings.reciter", value: userSettings.audioSettings.reciter, last_updated: now}
		);

		if (userSettings.audioSettings.translationReciter != null) await db.userSettings.put(
			{name: "audioSettings.translationReciter", value: userSettings.audioSettings.translationReciter, last_updated: now}
		);

		if (userSettings.audioSettings.playbackSpeed != null) await db.userSettings.put(
			{name: "audioSettings.playbackSpeed", value: userSettings.audioSettings.playbackSpeed, last_updated: now}
		);

		if (userSettings.audioSettings.playTranslation != null) await db.userSettings.put(
			{name: "audioSettings.playTranslation", value: userSettings.audioSettings.playTranslation, last_updated: now}
		);

		if (userSettings.audioSettings.versePlayButton != null) await db.userSettings.put(
			{name: "audioSettings.versePlayButton", value: userSettings.audioSettings.versePlayButton, last_updated: now}
		);
	}

	// Quiz settings
	if (userSettings.quiz) {
		if (userSettings.quiz.correctAnswers != null) await db.userSettings.put(
			{name: "quiz.correctAnswers", value: userSettings.quiz.correctAnswers, last_updated: now}
		);

		if (userSettings.quiz.wrongAnswers != null) await db.userSettings.put(
			{name: "quiz.wrongAnswers", value: userSettings.quiz.wrongAnswers, last_updated: now}
		);
	}

	// Last read
	if (userSettings.lastRead != null && userSettings.lastRead.key != null) await db.userSettings.put(
		{name: "lastRead", value: userSettings.lastRead.key, value2: userSettings.lastRead.page, last_updated: now}
	);

	// User bookmarks
	if (userSettings.userBookmarks != null) await db.userBookmarks.bulkPut(
		userSettings.userBookmarks
			.map((verseKey) => ({
				chapter: Number(verseKey.split(":")[0]), 
				verse: Number(verseKey.split(":")[1]),
				enabled: 1, 
				last_updated: now
			}))
	);

	// User notes
	if (userSettings.userNotes != null) await db.userNotes.bulkPut(
		Object.entries(userSettings.userNotes)
			.map(([verseKey, note]) => ({
				chapter: Number(verseKey.split(":")[0]), 
				verse: Number(verseKey.split(":")[1]),
				value: note.note,
				last_updated: note.modified_at
			}))
	);

	// Favourite chapters
	if (userSettings.favouriteChapters != null) await db.favouriteChapters.bulkPut(
		userSettings.favouriteChapters
			.map((verseKey) => ({
				chapter: Number(verseKey.split(":")[0]), 
				verse: Number(verseKey.split(":")[1]),
				enabled: 1,
				last_updated: now
			}))
	);

	// Initial setup
	if (userSettings.initialSetupCompleted != null) await db.userSettings.put(
		{name: "initialSetupCompleted", value: userSettings.initialSetupCompleted, last_updated: now}
	);

	// Chapter number
	if (userSettings.chapter != null) await db.userSettings.put(
		{name: "chapter", value: userSettings.chapter, last_updated: now}
	);

	// One-time modals (is shown?)
	if (!userSettings.oneTimeModals) {
		if (userSettings.oneTimeModals.changelogModal != null) await db.userSettings.put(
			{name: "oneTimeModals.changelogModal", value: userSettings.oneTimeModals.changelogModal, last_updated: now}
		);
	}
	
	localStorage.removeItem('userSettings');
}

export async function getUserSettingsOrDefaultFromDB() {
	let userSettings = {};
	let arabicTextSize = 'text-2xl';

	let dbUserSettings = {};
	await db.userSettings.each(row => {
		if (row.value2 == null) dbUserSettings[row.name] = row.value
		else dbUserSettings[row.name] = {value: row.value, value2: row.value2}
	});

	// For larger screens, make 'text-4xl' the default for Arabic word, else keep 'text-2xl' as default.
	if (window.matchMedia('(min-width: 1280px)').matches || window.matchMedia('(min-width: 1024px)').matches || window.matchMedia('(min-width: 768px)').matches) {
		arabicTextSize = 'text-4xl';
	}

	// Display settings
	if (!userSettings.displaySettings) userSettings.displaySettings = {}; // Parent

	userSettings.displaySettings.websiteTheme = dbUserSettings["displaySettings.websiteTheme"] ?? 1; // Gold
	userSettings.displaySettings.displayType = dbUserSettings["displaySettings.displayType"] ?? 1; // WBW
	userSettings.displaySettings.fontType = dbUserSettings["displaySettings.fontType"] ?? 1; // Uthmanic Hafs Digital
	userSettings.displaySettings.wordTranslationEnabled = !!(dbUserSettings["displaySettings.fontType"] ?? true); // Shown
	userSettings.displaySettings.wordTransliterationEnabled = !!(dbUserSettings["displaySettings.wordTransliterationEnabled"] ?? true); // Shown
	userSettings.displaySettings.wordTooltip = dbUserSettings["displaySettings.wordTooltip"] ?? 1; // None
	userSettings.displaySettings.autoScrollSpeed = dbUserSettings["displaySettings.autoScrollSpeed"] ?? 40; // x1
	userSettings.displaySettings.wakeLockEnabled = !!(dbUserSettings["displaySettings.wakeLockEnabled"] ?? false); // Enable sleep (default behaviour)
	userSettings.displaySettings.englishTerminology = !!(dbUserSettings["displaySettings.englishTerminology"] ?? false); // Quran terminologies language (default is Arabic)
	userSettings.displaySettings.hideNonDuaPart = !!(dbUserSettings["displaySettings.hideNonDuaPart"] ?? false); // Show all words

	// Font size settings (child of display settings)
	if (!userSettings.displaySettings.fontSizes) userSettings.displaySettings.fontSizes = {}; // Parent

	userSettings.displaySettings.fontSizes.arabicText = dbUserSettings["displaySettings.fontSizes.arabicText"] ?? arabicTextSize;
	userSettings.displaySettings.fontSizes.wordTranslationText =dbUserSettings["displaySettings.fontSizes.wordTranslationText"] ?? 'text-sm';
	userSettings.displaySettings.fontSizes.verseTranslationText = dbUserSettings["displaySettings.fontSizes.verseTranslationText"] ?? 'text-sm';

	// Translation settings
	if (!userSettings.translations) userSettings.translations = {}; // Parent

	userSettings.translations.word = dbUserSettings["translations.word"] ?? 1; // English

	const enabledDBTranslations = await db.userVerseTranslationsSettings.where("enabled").equals(1).primaryKeys();
	userSettings.translations.verse_v1 = enabledDBTranslations.length ? enabledDBTranslations : [1, 131]; // Transliteration, The Clear Quran

	userSettings.translations.tafsir = dbUserSettings["translations.tafsir"] ?? 30; // Tafsir Ibn Kathir

	// Transliteration settings
	if (!userSettings.transliteration) userSettings.transliteration = {}; // Parent

	userSettings.transliteration.word = dbUserSettings["transliteration.word"] ?? 1; // Normal

	// Audio settings
	if (!userSettings.audioSettings) userSettings.audioSettings = {}; // Parent

	userSettings.audioSettings.reciter = dbUserSettings["audioSettings.reciter"] ?? 10; // Mishary Rashid Alafasy
	userSettings.audioSettings.translationReciter = dbUserSettings["audioSettings.translationReciter"] ?? 1; // English - Ibrahim Walk (Sahih International)
	userSettings.audioSettings.playbackSpeed = dbUserSettings["audioSettings.playbackSpeed"] ?? 3; // x1
	userSettings.audioSettings.playTranslation = !!(dbUserSettings["audioSettings.reciter"] ?? false); // Verse translation
	userSettings.audioSettings.versePlayButton = dbUserSettings["audioSettings.versePlayButton"] ?? 1; // Play selected verse

	// Quiz settings
	if (!userSettings.quiz) userSettings.quiz = {}; // Parent

	userSettings.quiz.correctAnswers = dbUserSettings["quiz.correctAnswers"] ?? 0;
	userSettings.quiz.wrongAnswers =dbUserSettings["quiz.wrongAnswers"] ?? 0;

	// Last read
	const lastRead = dbUserSettings["lastRead"];
	userSettings.lastRead = lastRead ? {key: lastRead?.value, page: lastRead?.value2} : {};

	// User bookmarks
	const enabledDBBookmarks = (await db.userBookmarks.where("enabled").equals(1).primaryKeys())
		.map(bookmark => bookmark[0]+":"+bookmark[1]);
	userSettings.userBookmarks = enabledDBBookmarks.length ? enabledDBBookmarks : [];

	// User notes
	const enabledDBNotes = {};
	(await db.userNotes.where("value").notEqual("").toArray()).forEach((element) => {
		const verseKey = element.chapter+":"+element.verse;
		enabledDBNotes[verseKey] = {
			note: element.value,
			modified_at: new Date(element.last_updated).toISOString()
		};
	});
	userSettings.userNotes = enabledDBNotes;

	// Favourite chapters
	const enabledFavourites = (await db.favouriteChapters.where("enabled").equals(1).primaryKeys())
		.map(favourite => favourite[0]+":"+favourite[1]);;
	userSettings.favouriteChapters = enabledFavourites.length ? enabledFavourites : [1, 5, 18];

	// Initial setup
	userSettings.initialSetupCompleted = !!(dbUserSettings["initialSetupCompleted"] ?? false);

	// Chapter number
	userSettings.chapter = dbUserSettings["chapter"] ?? 1;

	// One-time modals (is shown?)
	if (!userSettings.oneTimeModals) userSettings.oneTimeModals = {}; // Parent
	userSettings.oneTimeModals.changelogModal = !!(dbUserSettings["oneTimeModals.changelogModal"] ?? false);

	return userSettings;
}

/**
 * Sets the user settings in global stores to those in the DB or default values.
 * This function is also used by resetSettings.js.
 */
export async function setUserSettings() {
	moveUserSettingsFromLocalStorageToDB();

	let userSettings = await getUserSettingsOrDefaultFromDB();

	const previousWebsiteTheme = localStorage.getItem('websiteTheme') ?? 1;
	localStorage.setItem('websiteTheme', userSettings.displaySettings.websiteTheme);
	initialiseUserSettingsStores(userSettings);

	if (userSettings.displaySettings.websiteTheme != previousWebsiteTheme) {
		location.reload();
	}
}
