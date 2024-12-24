import { db } from '$utils/dexieDB';
import { setUserSettingsStores } from './utils/stores';

// Setting default user settings in localStorage
(async function () {
	await setUserSettings();
})();

/**
 * Sets the default user settings in localStorage.
 * This function is also used by resetSettings.js.
 */
export async function setUserSettings() {
	let userSettings = JSON.parse(localStorage.getItem('userSettings'));
	let arabicTextSize = 'text-2xl';

	// For larger screens, make 'text-4xl' the default for Arabic word, else keep 'text-2xl' as default.
	if (window.matchMedia('(min-width: 1280px)').matches || window.matchMedia('(min-width: 1024px)').matches || window.matchMedia('(min-width: 768px)').matches) {
		arabicTextSize = 'text-4xl';
	}

	// Initialize userSettings if not set
	if (!userSettings) userSettings = {};

	// Display settings
	if (!userSettings.displaySettings) userSettings.displaySettings = {}; // Parent

	userSettings.displaySettings.websiteTheme = (await db.userSettings.get("displaySettings.websiteTheme"))?.value ?? 
		userSettings.displaySettings.websiteTheme ?? 1; // Gold
	userSettings.displaySettings.displayType = (await db.userSettings.get("displaySettings.displayType"))?.value ?? 
		userSettings.displaySettings.displayType ?? 1; // WBW
	userSettings.displaySettings.fontType = (await db.userSettings.get("displaySettings.fontType"))?.value ?? 
		userSettings.displaySettings.fontType ?? 1; // Uthmanic Hafs Digital
	userSettings.displaySettings.wordTranslationEnabled = !!((await db.userSettings.get("displaySettings.fontType"))?.value ?? 
		userSettings.displaySettings.wordTranslationEnabled ?? true); // Shown
	userSettings.displaySettings.wordTransliterationEnabled = !!((await db.userSettings.get("displaySettings.wordTransliterationEnabled"))?.value ??
		userSettings.displaySettings.wordTransliterationEnabled ?? true); // Shown
	userSettings.displaySettings.wordTooltip = (await db.userSettings.get("displaySettings.wordTooltip"))?.value ?? 
		userSettings.displaySettings.wordTooltip ?? 1; // None
	userSettings.displaySettings.autoScrollSpeed = (await db.userSettings.get("displaySettings.autoScrollSpeed"))?.value ?? 
		userSettings.displaySettings.autoScrollSpeed ?? 40; // x1
	userSettings.displaySettings.wakeLockEnabled = !!((await db.userSettings.get("displaySettings.wakeLockEnabled"))?.value ??
		userSettings.displaySettings.wakeLockEnabled ?? false); // Enable sleep (default behaviour)
	userSettings.displaySettings.englishTerminology = !!((await db.userSettings.get("displaySettings.englishTerminology"))?.value ??
		userSettings.displaySettings.englishTerminology ?? false); // Quran terminologies language (default is Arabic)
	userSettings.displaySettings.hideNonDuaPart = !!((await db.userSettings.get("displaySettings.hideNonDuaPart"))?.value ??
		userSettings.displaySettings.hideNonDuaPart ?? false); // Show all words

	// Font size settings (child of display settings)
	if (!userSettings.displaySettings.fontSizes) userSettings.displaySettings.fontSizes = {}; // Parent

	userSettings.displaySettings.fontSizes.arabicText = (await db.userSettings.get("displaySettings.fontSizes.arabicText"))?.value ?? 
	 userSettings.displaySettings.fontSizes.arabicText ?? arabicTextSize;
	userSettings.displaySettings.fontSizes.wordTranslationText = (await db.userSettings.get("displaySettings.fontSizes.wordTranslationText"))?.value ?? 
	 userSettings.displaySettings.fontSizes.wordTranslationText ?? 'text-sm';
	userSettings.displaySettings.fontSizes.verseTranslationText = (await db.userSettings.get("displaySettings.fontSizes.verseTranslationText"))?.value ?? 
	 userSettings.displaySettings.fontSizes.verseTranslationText ?? 'text-sm';

	// Translation settings
	if (!userSettings.translations) userSettings.translations = {}; // Parent

	userSettings.translations.word = (await db.userSettings.get("translations.word"))?.value ?? 
		userSettings.translations.word ?? 1; // English

	const hasDBTranslations = !!(await db.userVerseTranslationsSettings.count());
	const enabledDBTranslations = await db.userVerseTranslationsSettings.where("enabled").equals(1).primaryKeys();
	userSettings.translations.verse_v1 = (hasDBTranslations ? enabledDBTranslations : 
		userSettings.translations.verse_v1) ?? [1, 131]; // Transliteration, The Clear Quran

	userSettings.translations.tafsir = (await db.userSettings.get("translations.tafsir"))?.value ?? 
		userSettings.translations.tafsir ?? 30; // Tafsir Ibn Kathir

	// Transliteration settings
	if (!userSettings.transliteration) userSettings.transliteration = {}; // Parent

	userSettings.transliteration.word = (await db.userSettings.get("transliteration.word"))?.value ?? 
		userSettings.transliteration.word ?? 1; // Normal

	// Audio settings
	if (!userSettings.audioSettings) userSettings.audioSettings = {}; // Parent

	userSettings.audioSettings.reciter = (await db.userSettings.get("audioSettings.reciter"))?.value ?? 
		userSettings.audioSettings.reciter ?? 10; // Mishary Rashid Alafasy
	userSettings.audioSettings.translationReciter = (await db.userSettings.get("audioSettings.translationReciter"))?.value ?? 
		userSettings.audioSettings.translationReciter ?? 1; // English - Ibrahim Walk (Sahih International)
	userSettings.audioSettings.playbackSpeed = (await db.userSettings.get("audioSettings.playbackSpeed"))?.value ?? 
		userSettings.audioSettings.playbackSpeed ?? 3; // x1
	userSettings.audioSettings.playTranslation = !!((await db.userSettings.get("audioSettings.reciter"))?.value ?? 
		userSettings.audioSettings.playTranslation ?? false); // Verse translation
	userSettings.audioSettings.versePlayButton = (await db.userSettings.get("audioSettings.versePlayButton"))?.value ?? 
		userSettings.audioSettings.versePlayButton ?? 1; // Play selected verse

	// Quiz settings
	if (!userSettings.quiz) userSettings.quiz = {}; // Parent

	userSettings.quiz.correctAnswers = (await db.userSettings.get("quiz.correctAnswers"))?.value ?? 
		userSettings.quiz.correctAnswers ?? 0;
	userSettings.quiz.wrongAnswers = (await db.userSettings.get("quiz.wrongAnswers"))?.value ?? 
		userSettings.quiz.wrongAnswers ?? 0;

	// Last read
	const lastRead = await db.userSettings.get("lastRead");
	userSettings.lastRead = (lastRead ? {key: lastRead?.value, page: lastRead?.value2} :
		userSettings.lastRead) ?? {};

	// User bookmarks
	const hasDBBookmarks = !!(await db.userBookmarks.count());
	const enabledDBBookmarks = await db.userBookmarks.where("enabled").equals(1).primaryKeys();
	userSettings.userBookmarks = (hasDBBookmarks ? enabledDBBookmarks : 
		userSettings.userBookmarks) ?? [];

	// User notes
	const hasDBNotes = !!(await db.userNotes.count());
	const enabledDBNotes = {};
	(await db.userNotes.where("value").equals("").toArray()).forEach((element) => {
		enabledDBNotes[element.verseKey] = {
			note: element.value,
			modified_at: element.last_updated.toISOString()
		};
	});
	userSettings.userNotes = (hasDBNotes ? enabledDBNotes : 
		userSettings.userNotes) ?? {};

	// Favourite chapters
	userSettings.favouriteChapters = userSettings.favouriteChapters || [1, 5, 18];

	// Initial setup
	userSettings.initialSetupCompleted = !!((await db.userSettings.get("initialSetupCompleted"))?.value ?? 
		userSettings.initialSetupCompleted ?? false);

	// Chapter number
	userSettings.chapter = (await db.userSettings.get("chapter"))?.value ?? 
		userSettings.chapter ?? 1;

	// One-time modals (is shown?)
	if (!userSettings.oneTimeModals) userSettings.oneTimeModals = {}; // Parent

	userSettings.oneTimeModals.changelogModal = !!((await db.userSettings.get("oneTimeModals.changelogModal"))?.value ?? 
		userSettings.oneTimeModals.changelogModal ?? false);

	// Save updated userSettings to localStorage
	localStorage.setItem('userSettings', JSON.stringify(userSettings));
	setUserSettingsStores(userSettings);
}
