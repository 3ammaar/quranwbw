import { db } from '$utils/dexieDB';
import { liveQuery } from 'dexie';
import { pb } from '$utils/pocketBaseDB';
import { __pbAuth, __syncErrorNotificationVisible, __syncLoadingStates } from '$utils/stores';
import { setUserSettings } from '$src/hooks.client';

export function dbSubscribe() {
  pb.health.check().then(health => { if (health.code == 200) {
    pb.collection("users").subscribe("*", () => {
      if (pb.authStore.isValid) pb.collection("users").authRefresh()
        .catch(error => {
          if (error.status == 401) {
            pb.authStore.clear();
          }
        });
      __pbAuth.set(pb.authStore);
    });
  }}).catch(error => {
    console.log(error);
    __syncErrorNotificationVisible.set(true);
  });

  const wordHifdhCardUpSync = liveQuery(() => db.wordHifdhCard.where("synced").notEqual(1).toArray()).subscribe({
    next: result => {
      if (!pb.authStore.isValid || !result?.length) return;
      pb.health.check().then(health => { if (health.code == 200) {
        __syncLoadingStates.update(current => ({...current, "wordHifdhCardUpSync": true}));

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
            "interval": record.interval,
            ...(record.pocketbase_id && {id: record.pocketbase_id})
          });
        }

        batch.send().then(result => result.forEach(record => {
          db.wordHifdhCard.where("[chapter+verse+word+last_updated]").equals([record.body.chapter, record.body.verse, record.body.word, toJSDate(record.body.last_updated)])
            .modify({synced: 1, pocketbase_id: record.body.id}).catch(error => {
              console.log(error);
              __syncErrorNotificationVisible.set(true);
            });
        })).catch(error => {
          const collisions = error?.data?.data?.collisions;
          if (!collisions) {
            console.log(error);
            __syncErrorNotificationVisible.set(true);
            return;
          }
          putCollisions(collisions);
        });

        __syncLoadingStates.update(current => {
          const {wordHifdhCardUpSync: _, ...rest} = current;
          return rest;
        });
      }}).catch(error => {
        console.log(error);
        __syncErrorNotificationVisible.set(true);
      });
    },
    error: error => console.log(error)
  });

  const userBookmarkUpSync = liveQuery(() => db.userBookmark.where("synced").notEqual(1).toArray()).subscribe({
    next: result => {
      if (!pb.authStore.isValid || !result?.length) return;

      pb.health.check().then(health => { if (health.code == 200) {
        __syncLoadingStates.update(current => ({...current, "userBookmarkUpSync": true}));

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
          db.userBookmark.where("[chapter+verse+last_updated]").equals([record.body.chapter, record.body.verse, toJSDate(record.body.last_updated)])
            .modify({synced: 1, pocketbase_id: record.body.id}).catch(error => {
              console.log(error);
              __syncErrorNotificationVisible.set(true);
            });
        })).catch(error => {
          const collisions = error?.data?.data?.collisions;
          if (!collisions) {
            console.log(error);
            __syncErrorNotificationVisible.set(true);
            return;
          }
          putCollisions(collisions);
        });

        __syncLoadingStates.update(current => {
          const {userBookmarkUpSync: _, ...rest} = current;
          return rest;
        });
      }}).catch(error => {
        console.log(error);
        __syncErrorNotificationVisible.set(true);
      });
    },
    error: error => console.log(error)
  });

  const userNoteUpSync = liveQuery(() => db.userNote.where("synced").notEqual(1).toArray()).subscribe({
    next: result => {
      if (!pb.authStore.isValid || !result?.length) return;

      pb.health.check().then(health => { if (health.code == 200) {
        __syncLoadingStates.update(current => ({...current, "userNoteUpSync": true}));

        const batch = pb.createBatch();
        for (const record of result) {
          batch.collection("userNote").upsert({
            "userID": pb.authStore.record.id,
            "chapter": record.chapter,
            "verse": record.verse,
            "value": record.value,
            "modified_at": record.modified_at,
            "last_updated": record.last_updated,
            ...(record.pocketbase_id && {id: record.pocketbase_id})
          });
        }

        batch.send().then(result => result.forEach(record => {
          db.userNote.where("[chapter+verse+last_updated]").equals([record.body.chapter, record.body.verse, toJSDate(record.body.last_updated)])
            .modify({synced: 1, pocketbase_id: record.body.id}).catch(error => {
              console.log(error);
              __syncErrorNotificationVisible.set(true);
            });
        })).catch(error => {
          const collisions = error?.data?.data?.collisions;
          if (!collisions) {
            console.log(error);
            __syncErrorNotificationVisible.set(true);
            return;
          }
          putCollisions(collisions);
        });

        __syncLoadingStates.update(current => {
          const {userNoteUpSync: _, ...rest} = current;
          return rest;
        });
      }}).catch(error => {
        console.log(error);
        __syncErrorNotificationVisible.set(true);
      });
    },
    error: error => console.log(error)
  });

  const userFavouriteChapterUpSync = liveQuery(() => db.userFavouriteChapter.where("synced").notEqual(1).toArray()).subscribe({
    next: result => {
      if (!pb.authStore.isValid || !result?.length) return;

      pb.health.check().then(health => { if (health.code == 200) {
        __syncLoadingStates.update(current => ({...current, "userFavouriteChapterUpSync": true}));

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
          db.userFavouriteChapter.where("[chapter+verse+last_updated]").equals([record.body.chapter, record.body.verse, toJSDate(record.body.last_updated)])
            .modify({synced: 1, pocketbase_id: record.body.id}).catch(error => {
              console.log(error);
              __syncErrorNotificationVisible.set(true);
            });
        })).catch(error => {
          const collisions = error?.data?.data?.collisions;
          if (!collisions) {
            console.log(error);
            __syncErrorNotificationVisible.set(true);
            return;
          }
          putCollisions(collisions);
        });

        __syncLoadingStates.update(current => {
          const {userFavouriteChapterUpSync: _, ...rest} = current;
          return rest;
        });
      }}).catch(error => {
        console.log(error);
        __syncErrorNotificationVisible.set(true);
      });
    },
    error: error => console.log(error)
  });

  let lastReadLastSynced = new Date();
  const userSettingUpSync = liveQuery(() => db.userSetting.where("synced").notEqual(1).toArray()).subscribe({
    next: result => {
      if (!pb.authStore.isValid || !result?.length) return;
      if (result.length == 1 && result[0].name == "lastRead") {
        if ((new Date() - lastReadLastSynced) <= 10000) return;
        else lastReadLastSynced = new Date();
      }

      pb.health.check().then(health => { if (health.code == 200) {
        if (result.length != 1 || result[0].name != "lastRead") {
          __syncLoadingStates.update(current => ({...current, "userSettingUpSync": true}));
        }

        const batch = pb.createBatch();
        for (const record of result) {
          batch.collection("userSetting").upsert({
            "userID": pb.authStore.record.id,
            "name": record.name,
            "value": JSON.stringify(record.value),
            "last_updated": record.last_updated,
            ...(record.pocketbase_id && {id: record.pocketbase_id})
          });
        }

        batch.send().then(result => result.forEach(record => {
          db.userSetting.where("[name+last_updated]").equals([record.body.name, toJSDate(record.body.last_updated)])
            .modify({synced: 1, pocketbase_id: record.body.id}).catch(error => {
              console.log(error);
              __syncErrorNotificationVisible.set(true);
            });
        })).catch(error => {
          const collisions = error?.data?.data?.collisions;
          if (!collisions) {
            console.log(error);
            __syncErrorNotificationVisible.set(true);
            return;
          }
          putCollisions(collisions);
        });

        __syncLoadingStates.update(current => {
          const {userSettingUpSync: _, ...rest} = current;
          return rest;
        });
      }}).catch(error => {
        console.log(error);
        __syncErrorNotificationVisible.set(true);
      });
    },
    error: error => console.log(error)
  });

  window.onbeforeunload = () => {
    pb.collection("users").unsubscribe();
    wordHifdhCardUpSync.unsubscribe();
    userBookmarkUpSync.unsubscribe();
    userNoteUpSync.unsubscribe();
    userFavouriteChapterUpSync.unsubscribe();
    userSettingUpSync.unsubscribe();
  };
}

export function toPBDate(date) {
  return date.toISOString().replace('T', ' ');
}

export function toJSDate(date) {
  return new Date(date.replace(' ', 'T'));
}

function putCollisions(collisions) {
  for (const {table, body} of collisions) {
    if (table == "wordHifdhCard") putWordHifdhCardRecords([body], true);
    if (table == "userSetting") putUserSettingRecords([body], true);
    if (table == "userBookmark") putUserBookmarkRecords([body], true);
    if (table == "userNote") putUserNoteRecords([body], true);
    if (table == "userFavouriteChapter") putUserFavouriteChapterRecords([body], true);
  }
}

function putIfNotSooner(tableName, key, newRecord) {
  return db.table(tableName).get(key).then(existing => {
    if (!existing || existing.last_updated <= newRecord.last_updated) {
      return db.table(tableName).put(newRecord).then(() => true).catch(error => {
        console.log(error);
        __syncErrorNotificationVisible.set(true);
        return false;
      });
    } else if (existing) {
      return db.table(tableName).update(key, {pocketbase_id: newRecord.pocketbase_id, synced: 0})
        .then(() => true).catch(error => {
          console.log(error);
          __syncErrorNotificationVisible.set(true);
          return false;
        });
    }
    return true;
  }).catch(error => {
    console.log(error);
    __syncErrorNotificationVisible.set(true);
    return false;
  });
}

async function putWordHifdhCardRecords(wordHifdhCardRecords, soonerCheck = false) {
  let success = true;
  for (const record of wordHifdhCardRecords) {
    const newRecord = {
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
    };

    if (soonerCheck) success = await putIfNotSooner(
      "wordHifdhCard", 
      {chapter: record.chapter, verse: record.verse, word: record.word}, 
      newRecord
    ) && success;
    else success = await db.wordHifdhCard.put(newRecord).then(() => true).catch(error => {
      console.log(error);
      __syncErrorNotificationVisible.set(true);
      return false;
    }) && success;
  }
  return success;
}

async function putUserBookmarkRecords(userBookmarkRecords, soonerCheck = false) {
  let success = true;
  for (const record of userBookmarkRecords) {
    const newRecord = {
      chapter: record.chapter,
      verse: record.verse,
      enabled: record.enabled ? 1 : 0,
      last_updated: toJSDate(record.last_updated),
      synced: 1,
      pocketbase_id: record.id
    }

    if (soonerCheck) success = await putIfNotSooner(
      "userBookmark",
      {chapter: record.chapter, verse: record.verse},
      newRecord
    ) && success;
    else success = await db.userBookmark.put(newRecord).then(() => true).catch(error => {
      console.log(error);
      __syncErrorNotificationVisible.set(true);
      return false;
    }) && success;
  }
  return success;
}

async function putUserNoteRecords(userNoteRecords, soonerCheck = false) {
  let success = true;
  for (const record of userNoteRecords) {
    const newRecord = {
      chapter: record.chapter,
      verse: record.verse,
      value: record.value,
      modified_at: toJSDate(record.modified_at),
      last_updated: toJSDate(record.last_updated),
      synced: 1,
      pocketbase_id: record.id
    }

    if (soonerCheck) success = await putIfNotSooner(
      "userNote",
      {chapter: record.chapter, verse: record.verse},
      newRecord
    ) && success;
    else success = await db.userNote.put(newRecord).then(() => true).catch(error => {
      console.log(error);
      __syncErrorNotificationVisible.set(true);
      return false;
    }) && success;
  }
  return success;
}

async function putUserFavouriteChapterRecords(userFavouriteChapterRecords, soonerCheck = false) {
  let success = true;
  for (const record of userFavouriteChapterRecords) {
    const newRecord = {
      chapter: record.chapter,
      verse: record.verse,
      enabled: record.enabled ? 1 : 0,
      last_updated: toJSDate(record.last_updated),
      synced: 1,
      pocketbase_id: record.id
    }

    if (soonerCheck) success = await putIfNotSooner(
      "userFavouriteChapter",
      {chapter: record.chapter, verse: record.verse},
      newRecord
    ) && success;
    else success = await db.userFavouriteChapter.put(newRecord).then(() => true).catch(error => {
      console.log(error);
      __syncErrorNotificationVisible.set(true);
      return false;
    }) && success;
  }
  return success;
}

async function putUserSettingRecords(userSettingRecords, soonerCheck = false) {
  let success = true;
  for (const record of userSettingRecords) {
    const newRecord = {
      name: record.name,
      value: JSON.parse(record.value),
      last_updated: toJSDate(record.last_updated),
      synced: 1,
      pocketbase_id: record.id
    }

    if (soonerCheck) success = await putIfNotSooner(
      "userSetting",
      {name: record.name},
      newRecord
    ) && success;
    else success = await db.userSetting.put(newRecord).then(() => true).catch(error => {
      console.log(error);
      __syncErrorNotificationVisible.set(true);
      return false;
    }) && success;
  }
  return success;
}

export async function downSyncFromDate(date) {
  let success = true;

  const wordHifdhCardRecords = await pb.collection("wordHifdhCard").getFullList({
    filter: `last_updated > "${toPBDate(date)}"`
  }).catch(error => {
    console.log(error);
    __syncErrorNotificationVisible.set(true);
    success = false;
    return [];
  });

  if (wordHifdhCardRecords && wordHifdhCardRecords.length) {
    __syncLoadingStates.update(current => ({...current, "wordHifdhCardDownSync": true}));
    success = (await putWordHifdhCardRecords(wordHifdhCardRecords)) && success;
    __syncLoadingStates.update(current => {
      const {wordHifdhCardDownSync: _, ...rest} = current;
      return rest;
    });
  }

  const userBookmarkRecords = await pb.collection("userBookmark").getFullList({
    filter: `last_updated > "${toPBDate(date)}"`
  }).catch(error => {
    console.log(error);
    __syncErrorNotificationVisible.set(true);
    success = false;
    return [];
  });
  
  if (userBookmarkRecords && userBookmarkRecords.length) {
    __syncLoadingStates.update(current => ({...current, "userBookmarkDownSync": true}));
    success = (await putUserBookmarkRecords(userBookmarkRecords)) && success;
    __syncLoadingStates.update(current => {
      const {userBookmarkDownSync: _, ...rest} = current;
      return rest;
    });
  }

  const userNoteRecords = await pb.collection("userNote").getFullList({
    filter: `last_updated > "${toPBDate(date)}"`
  }).catch(error => {
    console.log(error);
    __syncErrorNotificationVisible.set(true);
    success = false;
    return [];
  });

  if (userNoteRecords && userNoteRecords.length) {
    __syncLoadingStates.update(current => ({...current, "userNoteDownSync": true}));
    success = (await putUserNoteRecords(userNoteRecords)) && success;
    __syncLoadingStates.update(current => {
      const {userNoteDownSync: _, ...rest} = current;
      return rest;
    });
  }

  const userFavouriteChapterRecords = await pb.collection("userFavouriteChapter").getFullList({
    filter: `last_updated > "${toPBDate(date)}"`
  }).catch(error => {
    console.log(error);
    __syncErrorNotificationVisible.set(true);
    success = false;
    return [];
  });

  if (userFavouriteChapterRecords && userFavouriteChapterRecords.length) {
    __syncLoadingStates.update(current => ({...current, "userFavouriteChapterDownSync": true}));
    success = (await putUserFavouriteChapterRecords(userFavouriteChapterRecords)) && success;
    __syncLoadingStates.update(current => {
      const {userFavouriteChapterDownSync: _, ...rest} = current;
      return rest;
    });
  }

  const userSettingRecords = await pb.collection("userSetting").getFullList({
    filter: `last_updated > "${toPBDate(date)}"`
  }).catch(error => {
    console.log(error);
    __syncErrorNotificationVisible.set(true);
    success = false;
    return [];
  });

  if (userSettingRecords && userSettingRecords.length) {
    __syncLoadingStates.update(current => ({...current, "userSettingDownSync": true}));
    success = (await putUserSettingRecords(userSettingRecords)) && success;
    __syncLoadingStates.update(current => {
      const {userSettingDownSync: _, ...rest} = current;
      return rest;
    });
  }

  return success;
}

export async function downSync() {
  if (!pb.authStore.isValid) return;

  const health = await pb.health.check().catch(error => {
    console.log(error);
    __syncErrorNotificationVisible.set(true);
  });
  if (health?.code != 200) {
    __syncErrorNotificationVisible.set(true);
    return;
  };

  const beforeSync = new Date();
  const lastDownSync = new Date(parseInt(localStorage.getItem("lastDownSync") ?? "949363200000"));
  
  let success = await downSyncFromDate(lastDownSync);

  if (success) {
    localStorage.setItem("lastDownSync", beforeSync.getTime());
  }
}

// Use setInterval() instead of subscriptions as missed subscriptions will need to be checked anyway,
// and realtime downsyncs are unlikely to be important enough to the user.
export function startDownSyncInterval() {
  setInterval(async () => {
    await downSync();
    await setUserSettings(false);
  }, 20000);
}