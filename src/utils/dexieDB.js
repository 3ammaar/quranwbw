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
    [chapter+verse+word+last_updated],
    synced,
    pocketbase_id,
    [chapter+due],
    [due+chapter+verse],
    [chapter+verse],
    [chapter+verse+due],
    [chapter+verse+interval]
  `,
  userSetting: `name, value, last_updated, [name+last_updated], synced, pocketbase_id`,
  userBookmark: `[chapter+verse], enabled, last_updated, [chapter+verse+last_updated], synced, pocketbase_id`,
  userNote: `[chapter+verse], value, modified_at, last_updated, [chapter+verse+last_updated], synced, pocketbase_id`,
  userFavouriteChapter: `[chapter+verse], enabled, last_updated, [chapter+verse+last_updated], synced, pocketbase_id`
});
