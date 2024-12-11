<script>
	import Modal from '$ui/FlowbiteSvelte/modal/Modal.svelte';
	import Spinner from '$svgs/Spinner.svelte';
	import Bismillah from '$display/Bismillah.svelte';
	import WordsBlock from '$display/verses/WordsBlock.svelte';
	import WordsBlockCursor from '$display/verses/WordsBlockCursor.svelte';
	import { buttonClasses } from '$data/commonClasses';
	import { quranMetaData } from '$data/quranMeta';
	import { errorLoadingDataMessage } from '$data/websiteSettings';
	import { __fontType, __verseKey, __learnModalVisible, __learnMode } from '$utils/stores';
	import { getModalTransition } from '$utils/getModalTransition';
	import { fetchVersesData } from '$utils/fetchData';
	import { getNextDueFromChapter, rescheduleVerse, reviewAll, learnFromChapter } from '$utils/learningScheduler';

	let headerText = "Recite and review";

	let verseData, verseKeys, verseNumber, chapterNumber;

	let cursor1, cursor2, cursorDiv;
	let hiddenIndex = 0;
	let correctIndex = 0;
	let stage = 0;

	$: {
		verseData = null;
		verseKeys = [null, null, null];
		hiddenIndex = 0;
		correctIndex = 0;
		stage = 0;

		chapterNumber = $__verseKey.split(':')[0];
		verseNumber = $__verseKey.split(':')[1];

		// The verse before the verse
		verseKeys[2] = chapterNumber + ":" + verseNumber;

		// The verse before the verse being reviewed, for context
		verseKeys[1] = (verseNumber - 1 > 0)
						? chapterNumber + ":" + (verseNumber-1)
						: null;

		// The verse twice before the verse being reviewed, for context
		verseKeys[0] = (verseNumber - 2 > 0)
						? chapterNumber + ":" + (verseNumber-2)
						: null;

		const verses = verseKeys.filter(v => v).join(',');
		verseData = fetchVersesData({ verses: verses, fontType: $__fontType, skipSave: true });

		// Re-run the block when learn modal visibility changes
		$__learnModalVisible;
	}

	function showNextCard(totalWords) {
		rescheduleVerse($__verseKey, correctIndex, totalWords);
		const nextVerseKey = getNextDueFromChapter(chapterNumber);
		if (nextVerseKey != null) {
			__verseKey.set(nextVerseKey);
			return true;
		} else {
			if ($__learnMode == "review") {
				if (reviewAll()) return true;
			} else if ($__learnMode == "learn") {
				if (learnFromChapter(chapterNumber)) return true;
			}
			__learnModalVisible.set(false);
			return false;
		}
	}
</script>

<Modal id="learnModal" bind:open={$__learnModalVisible} transitionParams={getModalTransition('bottom')} size="xl" class="!rounded-b-none md:!rounded-3xl" bodyClass="p-6" position="bottom" dismissable={stage == 0} center>
	<!-- Modal content -->
	<h3 id="learn-modal-title" class="mb-8 text-xl font-medium">{headerText}</h3>

	{#if verseData != null}
	{#await verseData}
		<Spinner size="10" />
	{:then data}
	<div class="text-lg mt-4">
		{#if stage == 0}
		Recite the next verse, revealing words as you go to check your recitation.
		Use the buttons or drag the arrow to reveal words.
		<b>If you make a mistake, or don't know the next word, click next.</b>
		{:else if stage == 1}
		Mark the word where your first mistake was, then click next. Use the buttons or drag the arrow to mark it.
		{:else}
		Re-memorise as much of the verse as you can, then click next or finish.
		{/if}
	</div>

	<div class="flex flex-col space-y-4 text-sm max-h-[60vh] overflow-y-scroll pr-2">
		
		{#if !verseKeys[0] || verseKeys[0].split(':')[1] == 1}
			<br>
			<h3 id="learn-modal-title" class="mb-8 text-xl font-medium">{quranMetaData[chapterNumber].transliteration} {verseKeys[2]}</h3>
			<Bismillah startVerse={1}/>
		{/if}
		{#if verseKeys[0]}
		<div class="flex flex-wrap direction-rtl">
			<WordsBlock
				value={data[verseKeys[0]]} 
				key={verseKeys[0]} 
				wordOnly={true} 
				hideVerseNumber={true}
			/>
		</div>
		{/if}
		{#if verseKeys[1]}
		<div class="flex flex-wrap direction-rtl">
			<WordsBlock
				value={data[verseKeys[1]]} 
				key={verseKeys[1]} 
				wordOnly={true} 
				hideVerseNumber={true}
			/>
		</div>
		{/if}
		<div class="flex flex-wrap direction-rtl" bind:this={cursorDiv}>
			{#if stage == 0}
			<WordsBlockCursor 
				onCursorChange={i => {
					hiddenIndex = i;
					if (stage == 0) {
						if (hiddenIndex > data[verseKeys[2]].meta.words) {
							correctIndex = hiddenIndex;
						}
						else {
							correctIndex = Math.max(hiddenIndex - 1, 0);
						}
					}
				}}
				color={"#2563eb"}
				getParent={() => {return cursorDiv}}
				bind:this={cursor1}
			/>
			{/if}
			{#if stage == 1}
			<WordsBlockCursor 
				initialIndex={correctIndex}
				onCursorChange={i => {
					correctIndex = i;
					if (correctIndex >= hiddenIndex) hiddenIndex = correctIndex + 1;
				}}
				color={"#2563eb"}
				getParent={() => {return cursorDiv}}
				bind:this={cursor2}
			/>
			{/if}
			<WordsBlock
				value={data[verseKeys[2]]} 
				key={verseKeys[2]} 
				hiddenIndex={hiddenIndex} 
				correctIndex={(stage != 1) ? null : correctIndex}
				wordOnly={true} 
				hasDraggableCursor={true}
				onCursorDragOver={(e) => {cursor1?.dragOver(e); cursor2?.dragOver(e)}}
			/>
		</div>
	</div>

	<div class="flex flex-row">
		{#if stage == 0}
		<button on:click={() => {stage = 1;}} class="w-full mr-2 mt-6 {buttonClasses}">Next</button>
		{/if}
		{#if stage == 1}
		<button
			on:click={() => {
				if (correctIndex > data[verseKeys[2]].meta.words) {
					showNextCard(data[verseKeys[2]].meta.words);
				} else {
					stage = 2;
					hiddenIndex = null;
				}
			}}
			class="w-full mr-2 mt-6 {buttonClasses}"
		>{
			(correctIndex > data[verseKeys[2]].meta.words) ? "Next - No mistakes"
			: (correctIndex == data[verseKeys[2]].meta.words) ? "Next - Forgot the end of the verse"
			: "Next - Forgot or made a mistake at the word highlighted in red"
		}</button>
		{/if}
		{#if stage == 2}
		<button
			on:click={() => {
				showNextCard(data[verseKeys[2]].meta.words);
			}}
			class="w-full mr-2 mt-6 {buttonClasses}"
		>Next</button>
		<button
			on:click={() => {
				rescheduleVerse($__verseKey, correctIndex, data[verseKeys[2]].meta.words);
				__learnModalVisible.set(false);
			}}
			class="w-fit mr-2 mt-6 {buttonClasses}"
		>Finish</button>
		{/if}
	</div>
	{:catch error}
		<p>{errorLoadingDataMessage}</p>
	{/await}
	{/if}
</Modal>