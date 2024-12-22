import Dexie from 'dexie';

export const db = new Dexie('myDatabase');

db.version(1).stores({
  wordHifdhCard: '[chapter+verse+word], due, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, last_review',
});
