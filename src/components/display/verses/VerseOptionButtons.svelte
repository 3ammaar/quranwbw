<script>
	export let key, value;

	import VerseOptionsDropdown from '$display/verses/VerseOptionsDropdown.svelte';
	import Bookmark from '$svgs/Bookmark.svelte';
	import BookmarkFilled from '$svgs/BookmarkFilled.svelte';
	import PlaySolid from '$svgs/PlaySolid.svelte';
	import Pause from '$svgs/Pause.svelte';
	import NotesFilled from '$svgs/NotesFilled.svelte';
	import DotsHorizontal from '$svgs/DotsHorizontal.svelte';
	import Eye from '$svgs/Eye.svelte';
	import Tooltip from '$ui/FlowbiteSvelte/tooltip/Tooltip.svelte';
	import { playVerseAudio, resetAudioSettings, setVersesToPlay, showAudioModal } from '$utils/audioController';
	import { __currentPage, __userSettings, __audioSettings, __verseKey, __userNotes, __notesModalVisible, __playButtonsFunctionality, __displayType } from '$utils/stores';
	import { updateSettings } from '$utils/updateSettings';
	import { term } from '$utils/terminologies';
	import { quranMetaData } from '$data/quranMeta';

	const chapter = parseInt(key.split(':')[0], 10);
	const verse = parseInt(key.split(':')[1], 10);
	const versesInChapter = quranMetaData[chapter].verses;
	const buttonClasses = `inline-flex items-center justify-center w-10 h-10 transition-colors duration-150 rounded-3xl focus:shadow-outline print:hidden ${window.theme('hover')}`;

	// For chapter page, just show the key, else show the complete chapter transliteration & key
	$: verseKeyClasses = `${buttonClasses} w-fit px-4 border font-medium ${window.theme('border')} ${window.theme('textSecondary')}`;

	// Update userBookmarks whenever the __userSettings changes
	$: userBookmarks = JSON.parse($__userSettings).userBookmarks;

	function audioHandler(key) {
		// Stop any audio if something is playing
		if ($__audioSettings.isPlaying) {
			resetAudioSettings({ location: 'end' });
		} else {
			// For chapter & mushaf page, respect the user select play button functionality
			if (['chapter', 'mushaf'].includes($__currentPage)) {
				handleAudioPlayOptions(key);
			} else {
				playVerseAudio({ key, language: 'arabic', timesToRepeat: 1 });
			}
		}
	}

	function handleAudioPlayOptions(key) {
		const { verse } = $__playButtonsFunctionality;

		switch (verse) {
			case 1:
				playVerseAudio({ key, language: 'arabic', timesToRepeat: 1 });
				break;
			case 2:
				setVersesToPlay({
					location: 'verseOptionsOrModal',
					chapter,
					startVerse: verse,
					endVerse: versesInChapter,
					audioRange: 'playFromHere'
				});
				playVerseAudio({ key: `${window.versesToPlayArray[0]}`, timesToRepeat: 1, language: 'arabic' });
				break;
			case 3:
				showAudioModal(key);
				break;
			default:
				playVerseAudio({ key, language: 'arabic', timesToRepeat: 1 });
				break;
		}
	}

	// Function to toggle words block for display mode #7
	function wordsBlockToggler(verse) {
		document.querySelector(`#verse-${verse}-words`).classList.toggle('hidden');
	}
</script>

<div class="verseButtons flex flex-row justify-between">
	<div class="flex flex-row w-full space-x-2">
		<!-- verse key -->
		<div class="flex flex-row space-x-2">
			<a href={$__currentPage === 'chapter' ? `#${key}` : `/${chapter}/${verse}`} class={verseKeyClasses} data-html2canvas-ignore>
				{#if $__currentPage === 'chapter'}
					<div class="text-xs">{key}</div>
				{:else}
					<div class="text-xs">{quranMetaData[chapter].transliteration}, {key}</div>
				{/if}
			</a>
			<Tooltip arrow={false} type="light" placement="top" class="z-30 hidden md:block font-normal">{term('verse')} {key}</Tooltip>
		</div>

		<!-- other verse buttons -->
		<div class="flex flex-row space-x-2">
			<!-- play verse button -->
			<button on:click={() => audioHandler(key)} class={buttonClasses} aria-label="Play">
				<div>
					<svelte:component this={$__audioSettings.isPlaying && $__audioSettings.playingKey === key ? Pause : PlaySolid} size={3.5} />
				</div>
			</button>
			<Tooltip arrow={false} type="light" placement="top" class="z-30 hidden md:block font-normal">Play</Tooltip>

			<!-- notes button -->
			{#if $__userNotes.hasOwnProperty(key)}
				<button
					on:click={() => {
						__verseKey.set(key);
						__notesModalVisible.set(true);
					}}
					class={buttonClasses}
					aria-label="Note"
				>
					<div><NotesFilled size={3.5} /></div>
				</button>
				<Tooltip arrow={false} type="light" placement="top" class="z-30 hidden md:block font-normal">Notes</Tooltip>
			{/if}

			<!-- bookmark/unbookmark button -->
			{#if userBookmarks.includes(key)}
				<button on:click={() => updateSettings({ type: 'userBookmarks', key, set: true })} class={buttonClasses} aria-label="Bookmark">
					<div>
						<svelte:component this={userBookmarks.includes(key) ? BookmarkFilled : Bookmark} size={3.5} />
					</div>
				</button>
				<Tooltip arrow={false} type="light" placement="top" class="z-30 hidden md:block font-normal">Bookmark</Tooltip>
			{/if}

			<!-- verses option dropdown -->
			<button id="verse-options-{verse}" class={buttonClasses} aria-label="Options" on:click={() => __verseKey.set(key)}>
				<div>
					<DotsHorizontal size={6} />
				</div>
			</button>
			<VerseOptionsDropdown page={value.meta.page} />
			<Tooltip triggeredBy="#verse-options-{verse}" arrow={false} type="light" placement="top" class="z-30 hidden md:block font-normal">Options</Tooltip>
		</div>
	</div>

	<!-- words block toggle button for display #7 -->
	{#if $__displayType === 7}
		<div class="flex flex-row">
			<button class={buttonClasses} aria-label="Toggle Words" on:click={() => wordsBlockToggler(verse)}>
				<div>
					<Eye />
				</div>
			</button>
			<Tooltip arrow={false} type="light" placement="top" class="z-30 hidden md:block font-normal">Toggle Words</Tooltip>
		</div>
	{/if}
</div>
