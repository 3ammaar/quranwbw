// TODO OPTIMISE
import { __learnMode, __verseKey, __learnModalVisible } from '$utils/stores';
import { quranMetaData } from '$data/quranMeta';
import { createEmptyCard, fsrs, generatorParameters, Rating } from 'ts-fsrs';
import { db } from '$utils/dexieDB';
import Dexie from 'dexie';

const fsrsParams = generatorParameters({ enable_fuzz: false, enable_short_term: true });
const fsrsScheduler = fsrs(fsrsParams);

const firstReviewDelayMs = 60 * 1000;

export async function rescheduleVerse(chapter, verse, correctWords, totalWords) {
  const now = new Date();
  var newCard;
  chapter = Number(chapter);
  verse = Number(verse);

  const currentVerseWordCards = await db.wordHifdhCard
    .where("[chapter+verse+word]")
    .between([chapter, verse, Dexie.minKey], [chapter, verse, Dexie.maxKey])
    .sortBy("word");

  if (currentVerseWordCards.length == totalWords + 1) {
    for (let i = 0; i < currentVerseWordCards.length; i++) {
      let currentCard = {
        due: currentVerseWordCards[i].due,
        stability: currentVerseWordCards[i].stability,
        difficulty: currentVerseWordCards[i].difficulty,
        elapsed_days: currentVerseWordCards[i].elapsed_days,
        scheduled_days: currentVerseWordCards[i].scheduled_days,
        reps: currentVerseWordCards[i].reps,
        lapses: currentVerseWordCards[i].lapses,
        state: currentVerseWordCards[i].state,
        last_review: currentVerseWordCards[i].last_review,
      }
      if (i < correctWords) {
        newCard = fsrsScheduler.next(currentCard, now, Rating.Good).card;
      } else {
        newCard = fsrsScheduler.next(currentCard, now, Rating.Again).card;
      }
      await db.wordHifdhCard.update(
        [chapter, verse, i], 
        Object.assign({interval: newCard.due - newCard.last_review, last_updated: now, synced: false}, newCard));
    };
  }
  else {
    const firstReviewDate = new Date(now.getTime() + firstReviewDelayMs);
    for (let i = 0; i <= totalWords; i++) {
      newCard = createEmptyCard(firstReviewDate);
      await db.wordHifdhCard.add(Object.assign(
        {chapter: chapter, verse: verse, word: i, interval: newCard.due - now, last_updated: now}, 
        newCard
      ));
    }
  }

  //TODO store logs
}

export async function learnFromChapter(chapter) {
  chapter = Number(chapter);
  const nextDueVerseKey = await getNextDueFromChapter(chapter);
  if (nextDueVerseKey) {
    __learnMode.set("learn");
    __verseKey.set(nextDueVerseKey);
    __learnModalVisible.set(true);
    return true;
  } else {
    const nextToLearnVerseKey = await getNextToLearn(chapter);
    if (nextToLearnVerseKey) {
      __learnMode.set("learn");
      __verseKey.set(nextToLearnVerseKey);
      __learnModalVisible.set(true);
      return true;
    } else {
      return false;
    }
  }
}

export async function reviewAll() {
  const now = new Date();

  var allDueChapters = new Set();

  for (let i = 1; i <= 114; i++) {
    const dueWordsCount = await db.wordHifdhCard
      .where("[chapter+due]")
      .between([i, Dexie.minKey], [i, now], true, true)
      .count();
    if (dueWordsCount > 0) allDueChapters.add(i);
  }
  
  const dueChapters = [...allDueChapters];

  if (dueChapters.length) {
    const randomChapter = dueChapters[Math.floor(Math.random() * dueChapters.length)];
    const nextDueVerseKey = await getNextDueFromChapter(randomChapter);
    if (nextDueVerseKey) {
      __learnMode.set("review");
      __verseKey.set(nextDueVerseKey);
      __learnModalVisible.set(true);
      return true;
    }
  }
  return false;
}

// Returns the word card with the soonest due date within the given chapter and verse
export async function getSoonestWordCard(chapter, verse) {
  const cards = await db.wordHifdhCard
    .where("[chapter+verse+word]")
    .between([chapter, verse, Dexie.minKey], [chapter, verse, Dexie.maxKey])
    .sortBy("due");
    
  return cards[0] ?? null;
}

// Returns the verse key of the verse with the soonest due date out of all verses that are due
export async function getNextDue() {
  const now = new Date();

  const rows = await db.wordHifdhCard
    .where("due")
    .belowOrEqual(now)
    .sortBy("due");

  const row = rows[0];
  if (!row) return null;
  return row.chapter + ":" + row.verse;
}

// Returns the verse key of the first (position-wise) verse in the chapter that is due
export async function getNextDueFromChapter(chapter) {
  chapter = Number(chapter);
  const now = new Date();

  const rows = await db.wordHifdhCard
    .where("[chapter+due]")
    .between([chapter, Dexie.minKey], [chapter, now])
    .sortBy("due");
  
  const row = rows[0];
  if (!row) return null;
  return row.chapter + ":" + row.verse;
}

// Returns a progress object for each chapter
export async function getProgressByChapter() {
  const dayInMs = 24 * 60 * 60 * 1000;
  return db.wordHifdhCard
    .orderBy("[chapter+verse+interval]")
    .keys()
    .then(result => result
      .reduce((acc, cur) => {
        if (!acc[cur[0]]) acc[cur[0]] = [];
        var prev = acc[cur[0]][cur[1]];
        if (!prev || cur[2] < prev) {
          acc[cur[0]][cur[1]] = cur[2];
        }
        return acc;
      }, [])
    )
    .then (result => {
      let allChaptersProgress = [];
      for (let chapter = 1; chapter <= 114; chapter++) {
        let chapterProgress = {
          "unseen" : [],
          "learning" : [],
          "acquired" : [],
          "stable" : [],
          "established" : [],
        };

        for (let verse = 1; verse <= quranMetaData[chapter].verses; verse++) {
          const interval = result[chapter]?.[verse];

          if (!interval) {
            chapterProgress.unseen.push(+verse);
          } else if (interval < 7 * dayInMs) {
            chapterProgress.learning.push(+verse);
          } else if (interval < 30 * dayInMs) {
            chapterProgress.acquired.push(+verse);
          } else if (interval < 150 * dayInMs) {
            chapterProgress.stable.push(+verse);
          } else {
            chapterProgress.established.push(+verse);
          }
        }

        allChaptersProgress[chapter] = chapterProgress;
      }

      return allChaptersProgress;
    });
}

// Returns the verse key of the first unseen verse in the given chapter
export async function getNextToLearn(chapter) {
  const verses = quranMetaData[chapter].verses;
  for (let verse = 1; verse <= verses; verse++) {
    const dueCard = await getSoonestWordCard(chapter, verse);
    const dueDate = dueCard?.due;
    if (!dueDate) return chapter + ":" + verse;
  }
  return null;
}

// Return all verses and their due dates in the form [[chapter, verse, due]]
export async function getDueDatesByVerse() { 
  return db.wordHifdhCard
    .orderBy("[chapter+verse+due]")
    .keys()
    .then(result => result
      .reduce((acc, cur) => {
        var prev = acc[acc.length-1];
        if (prev && prev[0] == cur[0] && prev[1] == cur[1]) {
          if (cur[2] < prev[2]) {
            acc[acc.length-1] = cur;
          }
        } else {
          acc.push(cur);
        }
        return acc;
      }, [])
    );
}