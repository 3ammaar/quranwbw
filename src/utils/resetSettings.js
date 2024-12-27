import { setUserSettingsStores } from '$utils/stores';
import { getUserSettingsOrDefaultFromDB } from '$src/hooks.client';
import { db } from '$utils/dexieDB';

export async function resetSettings() {

	// Remove current settings from localStorage, DB and global stores
	localStorage.removeItem('userSettings');
	const now = new Date();
	db.userSetting.where("name").notEqual("lastRead").modify({value: null, value2: null, last_updated: now, synced: 0});
	db.userVerseTranslationsSetting.where("enabled").equals(1).modify({enabled: 0, last_updated: now, synced: 0});
	db.userFavouriteChapter.where("enabled").equals(1).modify({enabled: 0, last_updated: now, synced: 0});

	// Get default user settings and set them in global stores
	let userSettings = await getUserSettingsOrDefaultFromDB();
	setUserSettingsStores(userSettings);
	localStorage.setItem('websiteTheme', userSettings.displaySettings.websiteTheme);

	// Reload the page
	location.reload();
}
