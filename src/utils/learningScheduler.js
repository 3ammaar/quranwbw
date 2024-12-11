/* eslint-disable no-unused-vars */
// TODO OPTIMISE
import { updateSettings } from '$utils/updateSettings';
import { __verseReviewDueDates, __learnMode, __wordInVerseReviewCards, __verseKey, __learnModalVisible } from '$utils/stores';
import { quranMetaData } from '$data/quranMeta';
import {createEmptyCard, fsrs, generatorParameters, Rating} from 'ts-fsrs';
import { get } from 'svelte/store';

const fsrsParams = generatorParameters({ enable_fuzz: false, enable_short_term: true });
const fsrsScheduler = fsrs(fsrsParams);

const firstReviewDelayMs = 60 * 1000;

export function rescheduleVerse(verseKey, correctWords, totalWords) {
  const now = new Date();

  const currentVerseWordCards = get(__wordInVerseReviewCards)[verseKey];
  const newVerseWordCards = [];

  if (currentVerseWordCards) {
    currentVerseWordCards.forEach((wordCard, i) => {
      if (i < correctWords) {
        newVerseWordCards[i] = fsrsScheduler.next(wordCard, now, Rating.Good).card;
      } else {
        newVerseWordCards[i] = fsrsScheduler.next(wordCard, now, Rating.Again).card;
      }
    });
  }
  else {
    const firstReviewDate = new Date(now.getTime() + firstReviewDelayMs);
    for (let i = 0; i <= totalWords; i++) {
      newVerseWordCards[i] = createEmptyCard(firstReviewDate);
    }
  }

  updateSettings({
    type: 'wordInVerseReviewCards', 
    verseKey: verseKey, 
    cards: newVerseWordCards
  });

  //TODO store logs

  const soonestCardDue = newVerseWordCards
    .reduce((prev, curr) => (prev && prev.due <= curr.due) ? prev : curr)
    .due;

  updateSettings({ type: 'verseReviewDueDates', key: verseKey, dueDate: soonestCardDue })
}

export function learnFromChapter(chapter) {
  const nextDueVerseKey = getNextDueFromChapter(chapter);
  if (nextDueVerseKey) {
    __learnMode.set("learn");
    __verseKey.set(nextDueVerseKey);
    __learnModalVisible.set(true);
    return true;
  } else {
    const nextToLearnVerseKey = getNextToLearn(chapter);
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

export function reviewAll() {
  const now = new Date();

  const allDueChapters = Object.entries(get(__verseReviewDueDates))
    .filter(([_, value]) => value?.dueDate && new Date(value.dueDate) <= now)
    .map(([key, _]) => key.split(':')[0]);
  const dueChapters = [...new Set(allDueChapters)];

  if (dueChapters.length) {
    const randomChapter = dueChapters[Math.floor(Math.random() * dueChapters.length)];
    const nextDueVerseKey = getNextDueFromChapter(randomChapter);
    if (nextDueVerseKey) {
      __learnMode.set("review");
      __verseKey.set(nextDueVerseKey);
      __learnModalVisible.set(true);
      return true;
    }
  }
  return false;
}

export function setDueDate(verseKey, dueDate) {
  updateSettings({ type: 'verseReviewDueDates', key: verseKey, dueDate: dueDate })
}

export function getDueDate(verseKey) {
  return get(__verseReviewDueDates)[verseKey]?.dueDate;
}

export function getNextDue() {
  const now = new Date();
  
  return Object.entries(get(__verseReviewDueDates))
    .filter(([_, value]) => value?.dueDate && new Date(value.dueDate) <= now)
    .reduce((prev, curr) => (prev && (prev[1].dueDate <= curr[1].dueDate)) ? prev : curr, null)
    ?.[0] ?? null;
}

export function getNextDueFromChapter(chapter) {
  const now = new Date();
  return Object.entries(get(__verseReviewDueDates))
    .filter(([key, value]) => key.split(':')[0] == chapter && value?.dueDate && new Date(value.dueDate) <= now)
    .reduce((prev, curr) => (prev && (prev[1].dueDate <= curr[1].dueDate)) ? prev : curr, null)
    ?.[0] ?? null;
}

export function getAllChaptersProgress() {
  let allChaptersProgress = [];
  for (let i = 1; i <= 114; i++) {
    allChaptersProgress[i] = getChapterProgress(i);
  }
  return allChaptersProgress;
}

export function getChapterProgress(chapter) {
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
    const verseKey = chapter + ':' + verse;
    const dueDate = get(__verseReviewDueDates)[verseKey]?.dueDate;
    if (!dueDate) chapterProgress.unseen.push(+verse);
    else {
      const previousDueDate = get(__verseReviewDueDates)[verseKey].previousDueDate;
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

export function getNextToLearn(chapter) {
  const verses = quranMetaData[chapter].verses;
  for (let verse = 1; verse <= verses; verse++) {
    const verseKey = chapter + ':' + verse;
    const dueDate = get(__verseReviewDueDates)[verseKey]?.dueDate;
    if (!dueDate) return verseKey;
  }
  return null;
}

export function getNumberDue() {
  const now = new Date();
  
  return Object.entries(get(__verseReviewDueDates))
    .filter(([_, value]) => value?.dueDate && new Date(value.dueDate) <= now)
    .length;
}