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
    pocketBaseID,
    [chapter+due],
    [due+chapter+verse],
    [chapter+verse],
    [chapter+verse+due],
    [chapter+verse+interval]
  `,
  userSettings: `name, value, value2, last_updated, synced`,
  userVerseTranslationsSettings: `name, enabled, last_updated, synced`,
  userBookmarks: `[chapter+verse], enabled, last_updated, synced`,
  userNotes: `[chapter+verse], value, last_updated, synced`,
  favouriteChapters: `[chapter+verse], enabled, last_updated, synced`
});
