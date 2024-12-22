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
        last_review: currentVerseWordCards[i].last_review
      }
      if (i < correctWords) {
        newCard = fsrsScheduler.next(currentCard, now, Rating.Good).card;
      } else {
        newCard = fsrsScheduler.next(currentCard, now, Rating.Again).card;
      }
      await db.wordHifdhCard.update([chapter, verse, i], newCard);
    };
  }
  else {
    const firstReviewDate = new Date(now.getTime() + firstReviewDelayMs);
    for (let i = 0; i <= totalWords; i++) {
      newCard = createEmptyCard(firstReviewDate);
      await db.wordHifdhCard.add(Object.assign({chapter: chapter, verse: verse, word: i}, newCard));
    }
  }

  //TODO store logs
}

export async function learnFromChapter(chapter) {
  chapter = Number(chapter);
  const nextDueVerseKey = await getNextDueVerseKeyFromChapter(chapter);
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
  await db.wordHifdhCard.where("due").belowOrEqual(now).each(
    row => allDueChapters.add(row.chapter)
  );
  
  const dueChapters = [...allDueChapters];

  if (dueChapters.length) {
    const randomChapter = dueChapters[Math.floor(Math.random() * dueChapters.length)];
    const nextDueVerseKey = await getNextDueVerseKeyFromChapter(randomChapter);
    if (nextDueVerseKey) {
      __learnMode.set("review");
      __verseKey.set(nextDueVerseKey);
      __learnModalVisible.set(true);
      return true;
    }
  }
  return false;
}

export async function getDueDate(chapter, verse) {
  const cards = await db.wordHifdhCard
    .where("[chapter+verse+word]")
    .between([chapter, verse, Dexie.minKey], [chapter, verse, Dexie.maxKey])
    .sortBy("due");
    
  return cards[0]?.due ?? null;
}

export async function getWordCard(chapter, verse) {
  const cards = await db.wordHifdhCard
    .where("[chapter+verse+word]")
    .between([chapter, verse, Dexie.minKey], [chapter, verse, Dexie.maxKey])
    .sortBy("due");
    
  return cards[0] ?? null;
}

// Returns the verse with the soonest due date out of all verses that are due
export async function getNextDueVerseKey() {
  const now = new Date();

  const rows = await db.wordHifdhCard
    .where("due")
    .belowOrEqual(now)
    .sortBy("due");

  const row = rows[0];
  if (!row) return null;
  return row.chapter + ":" + row.verse;
}

// Returns the first (position-wise) verse in the chapter that is due
export async function getNextDueVerseKeyFromChapter(chapter) {
  chapter = Number(chapter);
  const now = new Date();

  const rows = await db.wordHifdhCard
    .where("due")
    .belowOrEqual(now)
    .filter(row => row.chapter == chapter)
    .sortBy("due");
  
  const row = rows[0];
  if (!row) return null;
  return row.chapter + ":" + row.verse;
}

export async function getAllChaptersProgress() {
  let allChaptersProgress = [];
  for (let i = 1; i <= 114; i++) {
    allChaptersProgress[i] = await getChapterProgress(i);
  }
  return allChaptersProgress;
}

export async function getChapterProgress(chapter) {
  let chapterProgress = {
    "unseen" : [],
    "learning" : [],
    "acquired" : [],
    "stable" : [],
    "established" : [],
  };

  const dayInMs = 24 * 60 * 60 * 1000;
  const verses = quranMetaData[chapter].verses;
  for (let verse = 1; verse <= verses; verse++) {
    const wordCard = await getWordCard(chapter, verse);
    if (!wordCard) chapterProgress.unseen.push(+verse);
    else {
      const dueDate = wordCard.due;
      const previousDueDate = wordCard.last_review;
      const interval = previousDueDate ? new Date(previousDueDate).getTime() - new Date(dueDate).getTime() : null;
      if (!interval || (interval < 7 * dayInMs)) {
        chapterProgress.learning.push(+verse);
      } else if (interval < 30 * dayInMs) {
        chapterProgress.acquired.push(+verse);
      } else if (interval < 150 & dayInMs) {
        chapterProgress.stable.push(+verse);
      } else {
        chapterProgress.established.push(+verse);
      }
    }
  }

  return chapterProgress;
}

export async function getNextToLearn(chapter) {
  const verses = quranMetaData[chapter].verses;
  for (let verse = 1; verse <= verses; verse++) {
    const dueDate = await getDueDate(chapter, verse);
    if (!dueDate) return chapter + ":" + verse;
  }
  return null;
}

export async function getNumberDue() {
  const now = new Date();

  const verses = new Set();

  await db.wordHifdhCard
    .where("due")
    .belowOrEqual(now)
    .each(row => verses.add(row.chapter + ":" + row.verse))

  return verses.size;
}