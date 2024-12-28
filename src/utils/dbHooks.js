import { db } from '$utils/dexieDB';
import { liveQuery } from 'dexie';
import { pb } from '$utils/pocketBaseDB';
import { __pbAuth } from '$utils/stores';
import { setUserSettings } from '$src/hooks.client';

export function dbSubscribe() {
  pb.collection("users").subscribe("*", () => {
    if (pb.authStore.isValid) pb.collection("users").authRefresh()
      .catch(error => {
        if (error.status == 401) {
          pb.authStore.clear();
        }
      });
    __pbAuth.set(pb.authStore);
  });

  const wordHifdhCardUpSync = liveQuery(() => db.wordHifdhCard.where("synced").notEqual(1).toArray()).subscribe({
    next: result => {
      if (!pb.authStore.isValid || !result?.length) return;

      const batch = pb.createBatch();
      for (const record of result) {
        batch.collection("wordHifdhCard").upsert({
          "userID": pb.authStore.record.id,
          "chapter": record.chapter,
          "verse": record.verse,
          "word": record.word,
          "difficulty": record.difficulty,
          "due": record.due,
          "elapsed_days": record.elapsed_days,
          "lapses": record.lapses,
          "last_review": record.last_review,
          "reps": record.reps,
          "scheduled_days": record.scheduled_days,
          "stability": record.stability,
          "state": record.state,
          "last_updated": record.last_updated,
          ...(record.pocketbase_id && {id: record.pocketbase_id})
        });
      }

      batch.send().then(result => result.forEach(record => {
        db.wordHifdhCard.where("[chapter+verse+word]").equals([record.body.chapter, record.body.verse, record.body.word])
          .modify({synced: 1, pocketbase_id: record.body.id}).catch(error => console.log(error));
      })).catch(error => console.log(error));
    },
    error: error => console.log(error)
  });

  const userBookmarkUpSync = liveQuery(() => db.userBookmark.where("synced").notEqual(1).toArray()).subscribe({
    next: result => {
      if (!pb.authStore.isValid || !result?.length) return;

      const batch = pb.createBatch();
      for (const record of result) {
        batch.collection("userBookmark").upsert({
          "userID": pb.authStore.record.id,
          "chapter": record.chapter,
          "verse": record.verse,
          "enabled": !!record.enabled,
          "last_updated": record.last_updated,
          ...(record.pocketbase_id && {id: record.pocketbase_id})
        });
      }

      batch.send().then(result => result.forEach(record => {
        db.userBookmark.where("[chapter+verse]").equals([record.body.chapter, record.body.verse])
          .modify({synced: 1, pocketbase_id: record.body.id}).catch(error => console.log(error));
      })).catch(error => console.log(error));
    },
    error: error => console.log(error)
  });

  const userNoteUpSync = liveQuery(() => db.userNote.where("synced").notEqual(1).toArray()).subscribe({
    next: result => {
      if (!pb.authStore.isValid || !result?.length) return;

      const batch = pb.createBatch();
      for (const record of result) {
        batch.collection("userNote").upsert({
          "userID": pb.authStore.record.id,
          "chapter": record.chapter,
          "verse": record.verse,
          "value": record.value,
          "last_updated": record.last_updated,
          ...(record.pocketbase_id && {id: record.pocketbase_id})
        });
      }

      batch.send().then(result => result.forEach(record => {
        db.userNote.where("[chapter+verse]").equals([record.body.chapter, record.body.verse])
          .modify({synced: 1, pocketbase_id: record.body.id}).catch(error => console.log(error));
      })).catch(error => console.log(error));
    },
    error: error => console.log(error)
  });

  const userFavouriteChapterUpSync = liveQuery(() => db.userFavouriteChapter.where("synced").notEqual(1).toArray()).subscribe({
    next: result => {
      if (!pb.authStore.isValid || !result?.length) return;

      const batch = pb.createBatch();
      for (const record of result) {
        batch.collection("userFavouriteChapter").upsert({
          "userID": pb.authStore.record.id,
          "chapter": record.chapter,
          "verse": record.verse,
          "enabled": !!record.enabled,
          "last_updated": record.last_updated,
          ...(record.pocketbase_id && {id: record.pocketbase_id})
        });
      }

      batch.send().then(result => result.forEach(record => {
        db.userFavouriteChapter.where("[chapter+verse]").equals([record.body.chapter, record.body.verse])
          .modify({synced: 1, pocketbase_id: record.body.id}).catch(error => console.log(error));
      })).catch(error => console.log(error));
    },
    error: error => console.log(error)
  });

  window.onbeforeunload = () => {
    pb.collection("users").unsubscribe();
    wordHifdhCardUpSync.unsubscribe();
    userBookmarkUpSync.unsubscribe();
    userNoteUpSync.unsubscribe();
    userFavouriteChapterUpSync.unsubscribe();
  };
}

export function toPBDate(date) {
  return date.toISOString().replace('T', ' ');
}

export function toJSDate(date) {
  return new Date(date.replace(' ', 'T'));
}

export async function downSyncFromDate(date) {
  let success = true;

  const wordHifdhCardRecords = await pb.collection("wordHifdhCard").getFullList({
    filter: `last_updated > "${toPBDate(date)}"`
  }).catch(error => {
    console.log(error);
    success = false;
    return [];
  });

  for (const record of wordHifdhCardRecords) {
    await db.wordHifdhCard.put({
      chapter: record.chapter,
      verse: record.verse,
      word: record.word,
      due: toJSDate(record.due),
      stability: record.stability,
      difficulty: record.difficulty,
      elapsed_days: record.elapsed_days,
      scheduled_days: record.scheduled_days,
      reps: record.reps,
      lapses: record.lapses,
      state: record.state,
      last_review: record.last_review ? toJSDate(record.last_review) : null,
      interval: record.interval,
      last_updated: toJSDate(record.last_updated),
      synced: 1,
      pocketbase_id: record.id
    }).catch(error => {
      console.log(error);
      success = false;
    });
  }

  const userBookmarkRecords = await pb.collection("userBookmark").getFullList({
    filter: `last_updated > "${toPBDate(date)}"`
  }).catch(error => {
    console.log(error);
    success = false;
    return [];
  });

  for (const record of userBookmarkRecords) {
    await db.userBookmark.put({
      chapter: record.chapter,
      verse: record.verse,
      enabled: record.enabled ? 1 : 0,
      last_updated: toJSDate(record.last_updated),
      synced: 1,
      pocketbase_id: record.id
    }).catch(error => {
      console.log(error);
      success = false;
    });
  }

  const userNoteRecords = await pb.collection("userNote").getFullList({
    filter: `last_updated > "${toPBDate(date)}"`
  }).catch(error => {
    console.log(error);
    success = false;
    return [];
  });

  for (const record of userNoteRecords) {
    await db.userNote.put({
      chapter: record.chapter,
      verse: record.verse,
      value: record.value,
      last_updated: toJSDate(record.last_updated),
      synced: 1,
      pocketbase_id: record.id
    }).catch(error => {
      console.log(error);
      success = false;
    });
  }

  const userFavouriteChapterRecords = await pb.collection("userFavouriteChapter").getFullList({
    filter: `last_updated > "${toPBDate(date)}"`
  }).catch(error => {
    console.log(error);
    success = false;
    return [];
  });

  for (const record of userFavouriteChapterRecords) {
    await db.userFavouriteChapter.put({
      chapter: record.chapter,
      verse: record.verse,
      enabled: record.enabled ? 1 : 0,
      last_updated: toJSDate(record.last_updated),
      synced: 1,
      pocketbase_id: record.id
    }).catch(error => {
      console.log(error);
      success = false;
    });
  }

  return success;
}

// Use setInterval() instead of subscriptions as missed subscriptions will need to be checked anyway,
// and realtime downsyncs are unlikely to be important enough to the user.
export function startDownSyncInterval() {
  setInterval(async () => {
    if (!pb.authStore.isValid) return;

    const beforeSync = new Date();
    const lastDownSync = new Date(localStorage.getItem("lastDownSync")) ?? new Date(-8640000000000000);
    
    let success = downSyncFromDate(lastDownSync);

    if (success) {
      localStorage.setItem("lastDownSync", beforeSync);
    }

    setUserSettings(false);
  }, 20000);
}