/* eslint-disable no-undef */

routerAdd("GET", "/hello/{name}", (e) => {
  let name = e.request.pathValue("name")

  return e.json(200, { "message": "Hello " + name })
})

onBatchRequest((e) => {
  const userID = e.auth?.id;
  if (!userID) throw new UnauthorizedError();
  
  try {
    e.next();
  } catch (error) {
    const collisions = [];
    // eslint-disable-next-line no-unused-vars
    for (const [key, request] of Object.entries(e.batch)) {
      if (request.method == "POST" || request.method == "PUT" || request.method == "PATCH") {
        if (request.url.startsWith("/api/collections/userNote/records")) {
          const currentRecord = new DynamicModel({
            id: "",
            userID: "",
            chapter: 0,
            verse: 0,
            value: "",
            modified_at: "",
            last_updated: ""
          });
          
          try {
            $app.db()
              .select("userNote.*")
              .from("userNote")
              .where($dbx.hashExp({
                userID: userID,
                chapter: request.body.chapter,
                verse: request.body.verse
              }))
              .one(currentRecord);

            collisions.push({table: "userNote", body: currentRecord});
          } catch (error) { /* empty */ }
        } else if (request.url.startsWith("/api/collections/userBookmark/records")) {
          const currentRecord = new DynamicModel({
            id: "",
            userID: "",
            chapter: 0,
            verse: 0,
            enabled: false,
            last_updated: ""
          });
          
          try {
            $app.db()
              .select("userBookmark.*")
              .from("userBookmark")
              .where($dbx.hashExp({
                userID: userID,
                chapter: request.body.chapter,
                verse: request.body.verse
              }))
              .one(currentRecord);

            collisions.push({table: "userBookmark", body: currentRecord});
          } catch (error) { /* empty */ }
        } else if (request.url.startsWith("/api/collections/userFavouriteChapter/records")) {
          const currentRecord = new DynamicModel({
            id: "",
            userID: "",
            chapter: 0,
            verse: 0,
            enabled: false,
            last_updated: ""
          });
          
          try {
            $app.db()
              .select("userFavouriteChapter.*")
              .from("userFavouriteChapter")
              .where($dbx.hashExp({
                userID: userID,
                chapter: request.body.chapter,
                verse: request.body.verse
              }))
              .one(currentRecord);

            collisions.push({table: "userFavouriteChapter", body: currentRecord});
          } catch (error) { /* empty */ }
        } else if (request.url.startsWith("/api/collections/userSetting/records")) {
          const currentRecord = new DynamicModel({
            id: "",
            userID: "",
            name: "",
            value: "",
            last_updated: ""
          });
          
          try {
            $app.db()
              .select("userSetting.*")
              .from("userSetting")
              .where($dbx.hashExp({
                userID: userID,
                name: request.body.name
              }))
              .one(currentRecord);

            collisions.push({table: "userSetting", body: currentRecord});
          } catch (error) { /* empty */ }
        } else if (request.url.startsWith("/api/collections/wordHifdhCard/records")) {
          const currentRecord = new DynamicModel({
            id: "",
            userID: "",
            chapter: 0,
            verse: 0,
            word: 0,
            difficulty: -0,
            due: "",
            elapsed_days: 0,
            lapses: 0,
            last_review: "",
            reps: 0,
            scheduled_days: 0,
            stability: -0,
            state: 0,
            interval: 0,
            last_updated: ""
          });
          
          try {
            $app.db()
              .select("wordHifdhCard.*")
              .from("wordHifdhCard")
              .where($dbx.hashExp({
                userID: userID,
                chapter: request.body.chapter,
                verse: request.body.verse,
                word: request.body.word
              }))
              .one(currentRecord);

            collisions.push({table: "wordHifdhCard", body: currentRecord});
          } catch (error) { /* empty */ }
        } 
      }
    }
    error.value.data.collisions = collisions;
    throw error;
  }
})