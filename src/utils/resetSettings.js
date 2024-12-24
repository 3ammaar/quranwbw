import { setUserSettingsStores } from '$utils/stores';
import { getUserSettingsOrDefaultFromDB } from '$src/hooks.client';
import { db } from '$utils/dexieDB';

export async function resetSettings() {

	// Remove current settings from localStorage, DB and global stores
	localStorage.removeItem('userSettings');
	db.userSettings.where("name").notEqual("lastRead").delete();
	db.userVerseTranslationsSettings.clear();
	db.favouriteChapters.clear();

	// Get default user settings and set them in global stores
	let userSettings = await getUserSettingsOrDefaultFromDB();
	setUserSettingsStores(userSettings);
	localStorage.setItem('websiteTheme', userSettings.displaySettings.websiteTheme);

	// Reload the page
	location.reload();
}
