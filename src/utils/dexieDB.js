import Dexie from 'dexie';

export const db = new Dexie('quranwbw');

db.version(1).stores({
  wordHifdhCard: `
    [chapter+verse+word],
    last_updated,
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
    [chapter+due],
    [due+chapter+verse],
    [chapter+verse],
    [chapter+verse+due],
    [chapter+verse+interval]
  `,
  userSettings: `name, value, value2, last_updated`,
  userVerseTranslationsSettings: `name, enabled, last_updated`,
  userBookmarks: `verseKey, enabled, last_updated`,
  userNotes: `verseKey, value, last_updated`,
  favouriteChapters: `verseKey, enabled, last_updated`
});
