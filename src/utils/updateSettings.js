/* eslint-disable no-case-declarations */
import { get } from 'svelte/store';
import {
	__currentPage,
	__userSettings,
	__fontType,
	__displayType,
	__websiteTheme,
	__wordTranslation,
	__wordTransliteration,
	__verseTranslations,
	__verseTafsir,
	__wordTranslationEnabled,
	__wordTransliterationEnabled,
	__reciter,
	__translationReciter,
	__playbackSpeed,
	__playTranslation,
	__lastRead,
	__wordTooltip,
	__userBookmarks,
	__autoScrollSpeed,
	__wakeLockEnabled,
	__userNotes,
	__quizCorrectAnswers,
	__quizWrongAnswers,
	__englishTerminology,
	__hideNonDuaPart,
	__playButtonsFunctionality,
} from '$utils/stores';
import { db } from '$utils/dexieDB';
// import { uploadSettingsToCloud } from '$utils/cloudSettings';

// function to update website settings
export function updateSettings(props) {
	const userSettings = JSON.parse(get(__userSettings));
	// let uploadSettings = false;

	switch (props.type) {
		// for chapter number
		case 'chapter':
			userSettings.chapter = props.value;
			db.userSettings.put({name: "chapter", value: props.value, last_updated: new Date()});
			break;

		// for font types
		case 'fontType':
			__fontType.set(props.value);
			if (props.skipSave) return;
			userSettings.displaySettings.fontType = props.value;
			db.userSettings.put({name: "displaySettings.fontType", value: props.value, last_updated: new Date()});
			break;

		// for display types
		case 'displayType':
			__displayType.set(props.value);
			if (props.skipSave) return;
			userSettings.displaySettings.displayType = props.value;
			db.userSettings.put({name: "displaySettings.displayType", value: props.value, last_updated: new Date()});
			break;

		// for word tooltip
		case 'wordTooltip':
			__wordTooltip.set(props.value);
			userSettings.displaySettings.wordTooltip = props.value;
			db.userSettings.put({name: "displaySettings.wordTooltip", value: props.value, last_updated: new Date()});
			break;

		// for terminologies language
		case 'englishTerminology':
			__englishTerminology.set(props.value);
			userSettings.displaySettings.englishTerminology = props.value;
			db.userSettings.put({name: "displaySettings.englishTerminology", value: props.value, last_updated: new Date()});
			location.reload();
			break;

		// for website theme
		case 'websiteTheme':
			__websiteTheme.set(props.value);
			userSettings.displaySettings.websiteTheme = props.value;
			db.userSettings.put({name: "displaySettings.websiteTheme", value: props.value, last_updated: new Date()});
			localStorage.setItem('websiteTheme', props.value);
			location.reload();
			// document.documentElement.classList = '';
			// document.documentElement.classList = `theme-${props.value} ${window.bodyColors[props.value]}`;
			break;

		// for word translation view
		case 'wordTranslationEnabled':
			__wordTranslationEnabled.set(props.value);
			userSettings.displaySettings.wordTranslationEnabled = props.value;
			db.userSettings.put({name: "displaySettings.wordTranslationEnabled", value: props.value ? 1 : 0, last_updated: new Date()});
			break;

		// for word transliteration view
		case 'wordTransliterationEnabled':
			__wordTransliterationEnabled.set(props.value);
			userSettings.displaySettings.wordTransliterationEnabled = props.value;
			db.userSettings.put({name: "displaySettings.wordTransliterationEnabled", value: props.value ? 1 : 0, last_updated: new Date()});
			break;

		// for word translation
		case 'wordTranslation':
			__wordTranslation.set(props.value);
			userSettings.translations.word = props.value;
			db.userSettings.put({name: "translations.word", value: props.value, last_updated: new Date()});
			break;

		// for word transliteration
		case 'wordTransliteration':
			__wordTransliteration.set(props.value);
			userSettings.transliteration.word = props.value;
			db.userSettings.put({name: "transliteration.word", value: props.value, last_updated: new Date()});
			break;

		// for verse translations
		case 'verseTranslation':
			let verseTranslations = userSettings.translations.verse_v1;

			// if the translation already exists, then remove it, else add it
			verseTranslations.includes(props.value) ? (verseTranslations = verseTranslations.filter((x) => x !== props.value)) : verseTranslations.push(props.value);

			// update the verse translations
			userSettings.translations.verse_v1 = verseTranslations;
			if (verseTranslations.includes(props.value)) {
				db.userVerseTranslationsSettings.put({name: props.value, enabled: 1, last_updated: new Date()});
			} else {
				db.userVerseTranslationsSettings.put({name: props.value, enabled: 0, last_updated: new Date()});
			}
			__verseTranslations.set(verseTranslations);
			break;

		// for verse tafsir
		case 'verseTafsir':
			__verseTafsir.set(props.value);
			userSettings.translations.tafsir = props.value;
			db.userSettings.put({name: "translations.tafsir", value: props.value, last_updated: new Date()});
			break;

		// for verse reciter
		case 'reciter':
			__reciter.set(props.value);
			userSettings.audioSettings.reciter = props.value;
			db.userSettings.put({name: "audioSettings.reciter", value: props.value, last_updated: new Date()});
			break;

		// for translation reciter
		case 'translationReciter':
			__translationReciter.set(props.value);
			userSettings.audioSettings.translationReciter = props.value;
			db.userSettings.put({name: "audioSettings.translationReciter", value: props.value, last_updated: new Date()});
			break;

		// for playback speed
		case 'playbackSpeed':
			__playbackSpeed.set(props.value);
			userSettings.audioSettings.playbackSpeed = props.value;
			db.userSettings.put({name: "audioSettings.playbackSpeed", value: props.value, last_updated: new Date()});
			break;

		// for play translation toggle
		case 'playTranslation':
			__playTranslation.set(props.value);
			userSettings.audioSettings.playTranslation = props.value;
			db.userSettings.put({name: "audioSettings.playTranslation", value: props.value ? 1 : 0, last_updated: new Date()});
			break;

		// for Initial Setup
		case 'initialSetupCompleted':
			userSettings.initialSetupCompleted = props.value;
			db.userSettings.put({name: "initialSetupCompleted", value: props.value ? 1 : 0, last_updated: new Date()});
			break;

		// for v4 features modal
		case 'changelogModal':
			userSettings.oneTimeModals.changelogModal = props.value;
			db.userSettings.put({name: "oneTimeModals.changelogModal", value: props.value ? 1 : 0, last_updated: new Date()});
			break;

		case 'userBookmarks':
			const key = props.key;
			let userBookmarks = userSettings['userBookmarks'];

			// if override key was set, then just set the value key in storage
			if (props.override) {
				userBookmarks = key;
				const now = new Date();
				db.userBookmarks.clear().then(() => {
					db.userBookmarks.bulkAdd(key.map(bookmark => ({verseKey: bookmark, enabled: 1, last_updated: now})));
				});
			}

			// else just set what was provided as key invidually post validation
			else {
				// for old imports, only push if bookmark doesn't exist
				if (props.oldCheck) {
					if (!userBookmarks.includes(key)) userBookmarks.push(key);
				}

				// for existing bookmarks...
				// if the bookmark (key) already exists, then remove it, else add it
				else userBookmarks.includes(key) ? (userBookmarks = userBookmarks.filter((x) => x !== key)) : userBookmarks.push(key);

				
				
				if (userBookmarks.includes(key)) {
					// db.userBookmarks.put({verseKey: key, enabled: 1, last_updated: new Date()});
				} else {
					// db.userBookmarks.put({verseKey: key, enabled: 0, last_updated: new Date()});
				}
			}

			// update the bookmarks
			userSettings.userBookmarks = userBookmarks;
			__userBookmarks.set(userBookmarks);

			// upload settings to cloud on every update
			// if (props.set === true) uploadSettings = true;
			break;

		case 'userNotes':
			const value = props.value;
			const notes_key = props.key;
			const isWhitespaceString = (str) => !str.replace(/\s/g, '').length;
			let userNotes = userSettings['userNotes'];

			// if override key was set, then just set the value key in storage
			if (props.override) {
				userNotes = notes_key;
				db.userBookmarks.clear().then(() => {
					db.userBookmarks.bulkAdd(
						Object.entries(notes_key).map(
							([verseKey, note]) => ({verseKey: verseKey, value: note.note, last_updated: note.modified_at})
						)
					);
				});
			}

			// else just set what was provided as key invidually post validation
			else {
				const now = new Date();
				// we only save the note if it's not just only whitespace
				if (!isWhitespaceString(value)) {
					userNotes[notes_key] = {
						note: value,
						modified_at: now.toISOString()
					};
				} else if (value.length === 0) {
					if (Object.prototype.hasOwnProperty.call(userNotes, notes_key)) delete userNotes[notes_key];
				}

				db.userNotes.put({verseKey: notes_key, value: userNotes[notes_key]?.note ?? "", last_updated: now});
			}

			// update the notes
			userSettings.userNotes = userNotes;
			__userNotes.set(userNotes);

			// upload settings to cloud on every update
			// if (props.set === true) uploadSettings = true;
			break;

		// for last read
		case 'lastRead':
			if (['chapter', 'mushaf'].includes(get(__currentPage))) {
				__lastRead.set(props.value);
				userSettings.lastRead = props.value;
				db.userSettings.put({name: "lastRead", value: props.value.key, value2: props.value.page, last_updated: new Date()});
			}
			break;

		// for auto scroll
		case 'autoScrollSpeed':
			__autoScrollSpeed.set(props.value);
			userSettings.displaySettings.autoScrollSpeed = props.value;
			db.userSettings.put({name: "displaySettings.autoScrollSpeed", value: props.value, last_updated: new Date()});
			break;

		// for toggling wakeLock
		case 'wakeLockEnabled':
			__wakeLockEnabled.set(props.value);
			userSettings.displaySettings.wakeLockEnabled = props.value;
			db.userSettings.put({name: "displaySettings.wakeLockEnabled", value: props.value ? 1 : 0, last_updated: new Date()});
			break;

		// for toggling non-dua words
		case 'hideNonDuaPart':
			__hideNonDuaPart.set(props.value);
			userSettings.displaySettings.hideNonDuaPart = props.value;
			db.userSettings.put({name: "displaySettings.hideNonDuaPart", value: props.value ? 1 : 0, last_updated: new Date()});
			break;

		// for quiz correct answers
		case 'quizCorrectAnswers':
			__quizCorrectAnswers.set(props.value);
			userSettings.quiz.correctAnswers = props.value;
			db.userSettings.put({name: "quiz.correctAnswers", value: props.value, last_updated: new Date()});
			break;

		// for quiz wrong answers
		case 'quizWrongAnswers':
			__quizWrongAnswers.set(props.value);
			userSettings.quiz.wrongAnswers = props.value;
			db.userSettings.put({name: "quiz.wrongAnswers", value: props.value, last_updated: new Date()});
			break;

		// for verse play button
		case 'versePlayButton':
			__playButtonsFunctionality.set({
				verse: props.value,
				toolbar: 1
			});
			userSettings.audioSettings.versePlayButton = props.value;
			db.userSettings.put({name: "audioSettings.versePlayButton", value: props.value, last_updated: new Date()});
			break;

		// for increasing/decreasing font sizes
		case 'arabicText': // Arabic words
		case 'wordTranslationText': // word translations & transliterations
		case 'verseTranslationText': // verse translations & transliterations

			// set the new index and size
			const newSize = props.value;

			// change the font size for each 'element'
			document.querySelectorAll(`.${props.type}`).forEach((element) => {
				const currentSize = element.getAttribute('data-fontSize');

				// perform the action
				if (newSize !== undefined) {
					// remove the current class
					element.classList.remove(currentSize);

					// add the new class
					element.classList.add(newSize);

					// update the attribute
					element.setAttribute('data-fontSize', newSize);
				}
			});

			// update it in localSettings
			userSettings.displaySettings.fontSizes[`${props.type}`] = newSize;
			db.userSettings.put({name: `displaySettings.fontSizes.${props.type}`, value: newSize, last_updated: new Date()});

			break;
			
	}

	// update the settings back into global stores
	__userSettings.set(JSON.stringify(userSettings));	

	// upload settings to cloud if uploadSettings was set to true, which we only do for bookmarks and notes at the moment
	// if (uploadSettings === true) uploadSettingsToCloud();
}
