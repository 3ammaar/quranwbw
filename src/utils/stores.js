import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';
import { pb } from '$utils/pocketBaseDB'


let __websiteOnline,
	__currentPage,
	__chapterNumber,
	__pageNumber,
	__chapterData,
	__chapterDataLoaded,
	__verseTranslationData,
	__notesData,
	__verseKey,
	__userSettings,
	__userNotes,
	__userBookmarks,
	__userToken,
	__fontType,
	__wordTranslation,
	__wordTransliteration,
	__verseTranslations,
	__verseTafsir,
	__wordTranslationEnabled,
	__wordTransliterationEnabled,
	__reciter,
	__translationReciter,
	__timestampData,
	__playbackSpeed,
	__playTranslation,
	__displayType,
	__selectedDisplayId,
	__websiteTheme,
	__lastRead,
	__favouriteChapters,
	__pageURL,
	__settingsDrawerHidden,
	__topNavbarVisible,
	__bottomToolbarVisible,
	__mushafPageDivisions,
	__wordTooltip,
	__bottomAlert,
	__audioSettings,
	__morphologyKey,
	__downloadedDataSettings,
	__autoScrollSpeed,
	__firstVerseOnPage,
	__audioModalVisible,
	__notesModalVisible,
	__tajweedRulesModalVisible,
	__tokenModalVisible,
	__tafsirModalVisible,
	__quranNavigationModalVisible,
	__siteNavigationModalVisible,
	__settingsSelectorModal,
	__lexiconModalVisible,
	__changelogModalVisible,
	__verseTranslationModalVisible,
	__morphologyModalVisible,
	__learnModalVisible,
	__wakeLockEnabled,
	__quizCorrectAnswers,
	__quizWrongAnswers,
	__timeSpecificChapters,
	__englishTerminology,
	__hideNonDuaPart,
	__wordRoot,
	__playButtonsFunctionality,
	__mushafMinimalModeEnabled,
	__learnMode,
	__pbAuth,
	__syncErrorNotificationVisible,
	__syncLoadingStates;

if (browser) {
	
	// to store network status of website
	__websiteOnline = writable(true);

	// to store the current page
	__currentPage = writable('home');

	// to store the chapter number
	__chapterNumber = writable(1);

	// to store the page number
	__pageNumber = writable(1);

	// to store the chapter data fetched from the API
	__chapterData = writable(null);

	// to store the verse translation data fetch from Quran.com's API
	__verseTranslationData = writable(null);

	// to store the boolean value of the complete chapter data load
	__chapterDataLoaded = writable(null);

	// to store the user notes data fetched from the API
	__notesData = writable(null);

	// to store the verse key
	__verseKey = writable('1:1');

	// to store the token
	__userToken = writable(localStorage.getItem('userToken'));

	// to store the word timestamp data fetched from the API
	__timestampData = writable(null);

	// to store the display type - WBW, Normal, Continuous, etc...
	__selectedDisplayId = writable(1);

	// to store a random number (for now) when changing verses due to some issues while re-rendering the component (probably because I'm still learning Svelte)
	__pageURL = writable(null);

	// to store the toggle boolean settings drawer
	__settingsDrawerHidden = writable(true);

	// to store the toggle boolean for top navbar,
	__topNavbarVisible = writable(true);

	// to store the toggle boolean for bottom navbar
	__bottomToolbarVisible = writable(true);

	// to store the chapters and juz info of a mushaf page
	__mushafPageDivisions = writable(null);

	// to store the bottom alert info
	__bottomAlert = writable({
		visible: false,
		message: '...'
	});

	// to store all the audio settings
	__audioSettings = writable({
		isPlaying: false,
		timesToRepeat: 1,
		timesRepeated: 0,
		delay: 0
	});

	// to store the morphology verse/word key
	__morphologyKey = writable(null);

	// to store all the offline data settings
	__downloadedDataSettings = writable({
		allChaptersDownloaded: false,
		downloadedChapters: []
	});	

	// to store the first verse on page
	__firstVerseOnPage = writable(1);

	// modals & drawers ===============
	__audioModalVisible = writable(false);
	__notesModalVisible = writable(false);
	__tajweedRulesModalVisible = writable(false);
	__tokenModalVisible = writable(false);
	__tafsirModalVisible = writable(false);
	__quranNavigationModalVisible = writable(false);
	__siteNavigationModalVisible = writable(false);
	__settingsSelectorModal = writable({
		visible: false
	});
	__lexiconModalVisible = writable(false);
	__changelogModalVisible = writable(false);
	__verseTranslationModalVisible = writable(false);
	__morphologyModalVisible = writable(false);
	__learnModalVisible = writable(false);

	// for al-kahf on friday and al-mulk at night
	__timeSpecificChapters = writable({
		isFriday: false,
		isNight: false
	});

	// to store the word root for showing lexicon data
	__wordRoot = writable(null);

	// functionalities of the play buttons
	__playButtonsFunctionality = writable({
		verse: 1, // default is "play this verse"
		toolbar: 1 // default is "play from start"
	});

	// used to hide elements on pinch
	__mushafMinimalModeEnabled = writable(false);

	// used to indicate whether to just review past cards or to also learn new cards, or neither
	__learnMode = writable(null);

	// PocketBase AuthStore
	__pbAuth = writable(pb.authStore);
}

export function initialiseUserSettingsStores(userSettings) {
	// to store the local user settings from LocalStorage
	__userSettings = writable(JSON.stringify(userSettings));

	// to store the user notes
	__userNotes = writable(userSettings.userNotes);

	// to store the user bookmarks
	__userBookmarks = writable(userSettings.userBookmarks);

	// to store the font type - Uthmani, IndoPak, etc...
	__fontType = writable(userSettings.displaySettings.fontType);

	// to store the word translation
	__wordTranslation = writable(userSettings.translations.word);

	// to store the word transliteration
	__wordTransliteration = writable(userSettings.transliteration.word);

	// to store the verse translations
	__verseTranslations = writable(userSettings.translations.verse_v1);

	// to store the verse tafisr
	__verseTafsir = writable(userSettings.translations.tafsir);

	// to store the word translation toggle
	__wordTranslationEnabled = writable(userSettings.displaySettings.wordTranslationEnabled);

	// to store the word transliteration toggle
	__wordTransliterationEnabled = writable(userSettings.displaySettings.wordTransliterationEnabled);

	// to store reciter
	__reciter = writable(userSettings.audioSettings.reciter);
	__translationReciter = writable(userSettings.audioSettings.translationReciter);
	
	// to store playback speed
	__playbackSpeed = writable(userSettings.audioSettings.playbackSpeed);

	// to store the toggle boolean for play translation
	__playTranslation = writable(userSettings.audioSettings.playTranslation);

	// to store the display type - WBW, Normal, Continuous, etc...
	__displayType = writable(userSettings.displaySettings.displayType);

	// to store the website theme
	__websiteTheme = writable(userSettings.displaySettings.websiteTheme);

	// to store the last read key
	__lastRead = writable(userSettings.lastRead);

	// to store the user's favourite chapters
	__favouriteChapters = writable(userSettings.favouriteChapters);

	// to store the word tooltip type
	__wordTooltip = writable(userSettings.displaySettings.wordTooltip);

	// to store the auto scroll speed
	__autoScrollSpeed = writable(userSettings.displaySettings.autoScrollSpeed);

	// wake lock settings
	__wakeLockEnabled = writable(userSettings.displaySettings.wakeLockEnabled);

	// quiz settings
	__quizCorrectAnswers = writable(userSettings.quiz.correctAnswers);
	__quizWrongAnswers = writable(userSettings.quiz.wrongAnswers);

	// english/arabic Quranic terms
	__englishTerminology = writable(userSettings.displaySettings.englishTerminology);

	// show/hide non-dua words
	__hideNonDuaPart = writable(userSettings.displaySettings.hideNonDuaPart);

	__syncErrorNotificationVisible = writable(false);

	__syncLoadingStates = writable ({});
}

export function setUserSettingsStores(userSettings) {
	// to store the local user settings from LocalStorage
	__userSettings.set(JSON.stringify(userSettings));

	// // to store the user notes
	__userNotes.set(userSettings.userNotes);

	// // to store the user bookmarks
	__userBookmarks.set(userSettings.userBookmarks);

	// // to store the font type - Uthmani, IndoPak, etc...
	__fontType.set(userSettings.displaySettings.fontType);

	// // to store the word translation
	__wordTranslation.set(userSettings.translations.word);

	// // to store the word transliteration
	__wordTransliteration.set(userSettings.transliteration.word);

	// // to store the verse translations
	const currentTranslations = get(__verseTranslations) ?? [];
	if (currentTranslations.length != userSettings.translations.verse_v1.length
		|| !currentTranslations.every(value => userSettings.translations.verse_v1.includes(value))) {
			__verseTranslations.set(userSettings.translations.verse_v1);
		}
	
	// // to store the verse tafisr
	__verseTafsir.set(userSettings.translations.tafsir);

	// // to store the word translation toggle
	__wordTranslationEnabled.set(userSettings.displaySettings.wordTranslationEnabled);

	// // to store the word transliteration toggle
	__wordTransliterationEnabled.set(userSettings.displaySettings.wordTransliterationEnabled);

	// // to store reciter
	__reciter.set(userSettings.audioSettings.reciter);
	__translationReciter.set(userSettings.audioSettings.translationReciter);
	
	// // to store playback speed
	__playbackSpeed.set(userSettings.audioSettings.playbackSpeed);

	// // to store the toggle boolean for play translation
	__playTranslation.set(userSettings.audioSettings.playTranslation);

	// // to store the display type - WBW, Normal, Continuous, etc...
	__displayType.set(userSettings.displaySettings.displayType);

	// // to store the website theme
	__websiteTheme.set(userSettings.displaySettings.websiteTheme);

	// // to store the last read key
	__lastRead.set(userSettings.lastRead);

	// // to store the user's favourite chapters
	__favouriteChapters.set(userSettings.favouriteChapters);

	// // to store the word tooltip type
	__wordTooltip.set(userSettings.displaySettings.wordTooltip);

	// // to store the auto scroll speed
	__autoScrollSpeed.set(userSettings.displaySettings.autoScrollSpeed);

	// // wake lock settings
	__wakeLockEnabled.set(userSettings.displaySettings.wakeLockEnabled);

	// // quiz settings
	__quizCorrectAnswers.set(userSettings.quiz.correctAnswers);
	__quizWrongAnswers.set(userSettings.quiz.wrongAnswers);

	// // english/arabic Quranic terms
	__englishTerminology.set(userSettings.displaySettings.englishTerminology);

	// // show/hide non-dua words
	__hideNonDuaPart.set(userSettings.displaySettings.hideNonDuaPart);
}

export {
	__websiteOnline,
	__currentPage,
	__chapterNumber,
	__pageNumber,
	__chapterData,
	__chapterDataLoaded,
	__verseTranslationData,
	__notesData,
	__verseKey,
	__userSettings,
	__userNotes,
	__userBookmarks,
	__userToken,
	__fontType,
	__wordTranslation,
	__wordTransliteration,
	__verseTranslations,
	__verseTafsir,
	__wordTranslationEnabled,
	__wordTransliterationEnabled,
	__reciter,
	__translationReciter,
	__timestampData,
	__playbackSpeed,
	__playTranslation,
	__displayType,
	__selectedDisplayId,
	__websiteTheme,
	__lastRead,
	__favouriteChapters,
	__pageURL,
	__settingsDrawerHidden,
	__topNavbarVisible,
	__bottomToolbarVisible,
	__mushafPageDivisions,
	__wordTooltip,
	__bottomAlert,
	__audioSettings,
	__morphologyKey,
	__downloadedDataSettings,
	__autoScrollSpeed,
	__firstVerseOnPage,
	__audioModalVisible,
	__notesModalVisible,
	__tajweedRulesModalVisible,
	__tokenModalVisible,
	__tafsirModalVisible,
	__quranNavigationModalVisible,
	__siteNavigationModalVisible,
	__settingsSelectorModal,
	__lexiconModalVisible,
	__changelogModalVisible,
	__verseTranslationModalVisible,
	__morphologyModalVisible,
	__learnModalVisible,
	__wakeLockEnabled,
	__quizCorrectAnswers,
	__quizWrongAnswers,
	__timeSpecificChapters,
	__englishTerminology,
	__hideNonDuaPart,
	__wordRoot,
	__playButtonsFunctionality,
	__mushafMinimalModeEnabled,
	__learnMode,
	__pbAuth,
	__syncErrorNotificationVisible,
	__syncLoadingStates
};
