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

function updateDBSetting(name, value) {
	const newRecord = {name: name, value: value, last_updated: new Date(), synced: 0}
	db.userSetting.get({name: name}).then(existingSetting => {
		if (existingSetting) {
			if (JSON.stringify(existingSetting.value) != JSON.stringify(newRecord.value)) {
				db.userSetting.update(name, newRecord);
			}
		} else {
			db.userSetting.put(newRecord);
		}
	});
}

// function to update website settings
export function updateSettings(props) {
	const userSettings = JSON.parse(get(__userSettings));
	// let uploadSettings = false;

	switch (props.type) {
		// for chapter number
		case 'chapter':
			userSettings.chapter = props.value;
			updateDBSetting("chapter", props.value);
			break;

		// for font types
		case 'fontType':
			__fontType.set(props.value);
			if (props.skipSave) return;
			userSettings.displaySettings.fontType = props.value;
			updateDBSetting("displaySettings.fontType", props.value);
			break;

		// for display types
		case 'displayType':
			__displayType.set(props.value);
			if (props.skipSave) return;
			userSettings.displaySettings.displayType = props.value;
			updateDBSetting("displaySettings.displayType", props.value);
			break;

		// for word tooltip
		case 'wordTooltip':
			__wordTooltip.set(props.value);
			userSettings.displaySettings.wordTooltip = props.value;
			updateDBSetting("displaySettings.wordTooltip", props.value);
			break;

		// for terminologies language
		case 'englishTerminology':
			__englishTerminology.set(props.value);
			userSettings.displaySettings.englishTerminology = props.value;
			updateDBSetting("displaySettings.englishTerminology", props.value);
			location.reload();
			break;

		// for website theme
		case 'websiteTheme':
			__websiteTheme.set(props.value);
			userSettings.displaySettings.websiteTheme = props.value;
			updateDBSetting("displaySettings.websiteTheme", props.value);
			localStorage.setItem('websiteTheme', props.value);
			location.reload();
			// document.documentElement.classList = '';
			// document.documentElement.classList = `theme-${props.value} ${window.bodyColors[props.value]}`;
			break;

		// for word translation view
		case 'wordTranslationEnabled':
			__wordTranslationEnabled.set(props.value);
			userSettings.displaySettings.wordTranslationEnabled = props.value;
			updateDBSetting("displaySettings.wordTranslationEnabled", props.value ? 1 : 0);
			break;

		// for word transliteration view
		case 'wordTransliterationEnabled':
			__wordTransliterationEnabled.set(props.value);
			userSettings.displaySettings.wordTransliterationEnabled = props.value;
			updateDBSetting("displaySettings.wordTransliterationEnabled", props.value ? 1 : 0);
			break;

		// for word translation
		case 'wordTranslation':
			__wordTranslation.set(props.value);
			userSettings.translations.word = props.value;
			updateDBSetting("translations.word", props.value);
			break;

		// for word transliteration
		case 'wordTransliteration':
			__wordTransliteration.set(props.value);
			userSettings.transliteration.word = props.value;
			updateDBSetting("transliteration.word", props.value);
			break;

		// for verse translations
		case 'verseTranslation':
			let verseTranslations = userSettings.translations.verse_v1;

			// if the translation already exists, then remove it, else add it
			verseTranslations.includes(props.value) ? (verseTranslations = verseTranslations.filter((x) => x !== props.value)) : verseTranslations.push(props.value);

			// update the verse translations
			userSettings.translations.verse_v1 = verseTranslations;
			updateDBSetting("transliteration.verse_v1", JSON.stringify(verseTranslations));
			__verseTranslations.set(verseTranslations);
			break;

		// for verse tafsir
		case 'verseTafsir':
			__verseTafsir.set(props.value);
			userSettings.translations.tafsir = props.value;
			updateDBSetting("translations.tafsir", props.value);
			break;

		// for verse reciter
		case 'reciter':
			__reciter.set(props.value);
			userSettings.audioSettings.reciter = props.value;
			updateDBSetting("audioSettings.reciter", props.value);
			break;

		// for translation reciter
		case 'translationReciter':
			__translationReciter.set(props.value);
			userSettings.audioSettings.translationReciter = props.value;
			updateDBSetting("audioSettings.translationReciter", props.value);
			break;

		// for playback speed
		case 'playbackSpeed':
			__playbackSpeed.set(props.value);
			userSettings.audioSettings.playbackSpeed = props.value;
			updateDBSetting("audioSettings.playbackSpeed", props.value);
			break;

		// for play translation toggle
		case 'playTranslation':
			__playTranslation.set(props.value);
			userSettings.audioSettings.playTranslation = props.value;
			updateDBSetting("audioSettings.playTranslation", props.value ? 1 : 0);
			break;

		// for Initial Setup
		case 'initialSetupCompleted':
			userSettings.initialSetupCompleted = props.value;
			updateDBSetting("initialSetupCompleted", props.value ? 1 : 0);
			break;

		// for v4 features modal
		case 'changelogModal':
			userSettings.oneTimeModals.changelogModal = props.value;
			updateDBSetting("oneTimeModals.changelogModal", props.value ? 1 : 0);
			break;

		case 'userBookmarks':
			const key = props.key;
			let userBookmarks = userSettings['userBookmarks'];

			// if override key was set, then just set the value key in storage
			if (props.override) {
				userBookmarks = key;
				const now = new Date();
				db.userBookmark.where("enabled").equals(1).modify({enabled: 0, last_updated: now, synced: 0}).then(() => {
					for (const bookmark of key) {
						const chapter = Number(bookmark.split(":")[0]);
						const verse = Number(bookmark.split(":")[1]);
						const newRecord = {
							chapter: chapter, 
							verse: verse,
							enabled: 1,
							last_updated: new Date(),
							synced: 0
						};
						db.userBookmark.get({chapter: chapter, verse: verse}).then(existingBookmark => {
							if (existingBookmark) {
								db.userBookmark.update([chapter, verse], newRecord);
							} else {
								db.userBookmark.put(newRecord);
							}
						});
					}
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

				const chapter = Number(key.split(":")[0]);
				const verse = Number(key.split(":")[1]);
				const newRecord = {
					chapter: chapter, 
					verse: verse,
					enabled: userBookmarks.includes(key) ? 1 : 0,
					last_updated: new Date(),
					synced: 0
				};
				db.userBookmark.get({chapter: chapter, verse: verse}).then(existingBookmark => {
					if (existingBookmark) {
						db.userBookmark.update([chapter, verse], newRecord);
					} else {
						db.userBookmark.put(newRecord);
					}
				}).catch(e => console.log(e));
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
				const now = new Date();
				db.userNote.where("value").notEqual("").modify({value: "", modified_at: null, last_updated: now, synced: 0}).then(() => {
					for (const [verseKey, note] of notes_key) {
						const chapter = Number(verseKey.split(":")[0]);
						const verse = Number(verseKey.split(":")[1]);
						const newRecord = {
							chapter: chapter, 
							verse: verse,
							value: note.note,
							modified_at: note.modified_at,
							last_updated: now,
							synced: 0
						};
						db.userNote.get({chapter: chapter, verse: verse}).then(existingNote => {
							if (existingNote) {
								db.userNote.update([chapter, verse], newRecord);
							} else {
								db.userNote.put(newRecord);
							}
						});
					}
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

				const chapter = Number(notes_key.split(":")[0]);
				const verse = Number(notes_key.split(":")[1]);
				const newRecord = {
					chapter: chapter, 
					verse: verse,
					value: userNotes[notes_key]?.note ?? "",
					modified_at: userNotes[notes_key]?.modified_at ?? null,
					last_updated: now,
					synced: 0
				};
				db.userNote.get({chapter: chapter, verse: verse}).then(existingNote => {
					if (existingNote) {
						db.userNote.update([chapter, verse], newRecord);
					} else {
						db.userNote.put(newRecord);
					}
				});
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
				updateDBSetting("lastRead", JSON.stringify(props.value));
			}
			break;

		// for auto scroll
		case 'autoScrollSpeed':
			__autoScrollSpeed.set(props.value);
			userSettings.displaySettings.autoScrollSpeed = props.value;
			updateDBSetting("displaySettings.autoScrollSpeed", props.value);
			break;

		// for toggling wakeLock
		case 'wakeLockEnabled':
			__wakeLockEnabled.set(props.value);
			userSettings.displaySettings.wakeLockEnabled = props.value;
			updateDBSetting("displaySettings.wakeLockEnabled", props.value ? 1 : 0);
			break;

		// for toggling non-dua words
		case 'hideNonDuaPart':
			__hideNonDuaPart.set(props.value);
			userSettings.displaySettings.hideNonDuaPart = props.value;
			updateDBSetting("displaySettings.hideNonDuaPart", props.value ? 1 : 0);
			break;

		// for quiz correct answers
		case 'quizCorrectAnswers':
			__quizCorrectAnswers.set(props.value);
			userSettings.quiz.correctAnswers = props.value;
			updateDBSetting("quiz.correctAnswers", props.value);
			break;

		// for quiz wrong answers
		case 'quizWrongAnswers':
			__quizWrongAnswers.set(props.value);
			userSettings.quiz.wrongAnswers = props.value;
			updateDBSetting("quiz.wrongAnswers", props.value);
			break;

		// for verse play button
		case 'versePlayButton':
			__playButtonsFunctionality.set({
				verse: props.value,
				toolbar: 1
			});
			userSettings.audioSettings.versePlayButton = props.value;
			updateDBSetting("audioSettings.versePlayButton", props.value);
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
			updateDBSetting(`displaySettings.fontSizes.${props.type}`, newSize);

			break;
			
	}

	// update the settings back into global stores
	__userSettings.set(JSON.stringify(userSettings));	

	// upload settings to cloud if uploadSettings was set to true, which we only do for bookmarks and notes at the moment
	// if (uploadSettings === true) uploadSettingsToCloud();
}
