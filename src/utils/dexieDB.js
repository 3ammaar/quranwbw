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
  `
});
