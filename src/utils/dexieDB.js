import Dexie from 'dexie';

export const db = new Dexie('quranwbw');

db.version(1).stores({
  wordHifdhCard: `
    [chapter+verse+word],
    due,
    stability,
    difficulty,
    elapsed_days,
    scheduled_days,
    reps,
    lapses,
    state,
    last_review,
    interval,
    last_updated,
    synced,
    pocketbase_id,
    [chapter+due],
    [due+chapter+verse],
    [chapter+verse],
    [chapter+verse+due],
    [chapter+verse+interval]
  `,
  userSetting: `name, value, value2, last_updated, synced`,
  userVerseTranslationsSetting: `name, enabled, last_updated, synced`,
  userBookmark: `[chapter+verse], enabled, last_updated, synced, pocketbase_id`,
  userNote: `[chapter+verse], value, last_updated, synced, pocketbase_id`,
  userFavouriteChapter: `[chapter+verse], enabled, last_updated, synced, pocketbase_id`
});
