<script>
	export let page;

	import Dropdown from '$ui/FlowbiteSvelte/dropdown/Dropdown.svelte';
	import DropdownItem from '$ui/FlowbiteSvelte/dropdown/DropdownItem.svelte';

	import Play from '$svgs/Play.svelte';
	import Bookmark from '$svgs/Bookmark.svelte';
	import BookmarkFilled from '$svgs/BookmarkFilled.svelte';
	import Notes from '$svgs/Notes.svelte';
	import NotesFilled from '$svgs/NotesFilled.svelte';
	import Tafsir from '$svgs/Tafsir.svelte';
	import VerseTranslation from '$svgs/VerseTranslation.svelte';
	import ChapterMode from '$svgs/ChapterMode.svelte';
	import Book from '$svgs/Book.svelte';
	import Morphology from '$svgs/Morphology.svelte';
	import Share from '$svgs/Share.svelte';

	import { showAudioModal } from '$utils/audioController';
	import { quranMetaData } from '$data/quranMeta';
	import { selectableDisplays } from '$data/options';
	import { __userSettings, __verseKey, __notesModalVisible, __tafsirModalVisible, __verseTranslationModalVisible, __currentPage, __displayType, __userNotes } from '$utils/stores';
	import { updateSettings } from '$utils/updateSettings';
	import { term } from '$utils/terminologies';

	const dropdownItemClasses = `flex flex-row items-center space-x-2 font-normal rounded-3xl ${window.theme('hover')}`;
	let dropdownOpen = false;

	// Update userBookmarks whenever the __userSettings changes
	$: userBookmarks = JSON.parse($__userSettings).userBookmarks;

	// Open share menu
	function shareVerse() {
		const [chapter, verse] = $__verseKey.split(':').map(Number);

		if (navigator.share) {
			navigator.share({
				title: `${quranMetaData[chapter].transliteration}, ${term('verse')} ${verse}`,
				url: `https://quranwbw.com/${chapter}/${verse}`
			});
		}
	}
</script>

<Dropdown bind:open={dropdownOpen} class="px-2 mr-2 my-2 w-max text-left font-sans direction-ltr">
	<div class="py-2 px-4 text-xs font-semibold text-left">{term('verse')} {$__verseKey}</div>

	<!-- play verse button -->
	<DropdownItem
		class={dropdownItemClasses}
		on:click={() => {
			showAudioModal($__verseKey);
			dropdownOpen = false;
		}}
	>
		<Play />
		<span>Advanced Play</span>
	</DropdownItem>

	<!-- bookmark button -->
	<DropdownItem class={dropdownItemClasses} on:click={() => updateSettings({ type: 'userBookmarks', key: $__verseKey, set: true })}>
		<svelte:component this={userBookmarks.includes($__verseKey) ? BookmarkFilled : Bookmark} />
		<span>{userBookmarks.includes($__verseKey) ? `Unbookmark  ${term('verse')}` : `Bookmark ${term('verse')}`}</span>
	</DropdownItem>

	<!-- verse notes button -->
	<DropdownItem
		class={dropdownItemClasses}
		on:click={() => {
			__notesModalVisible.set(true);
			dropdownOpen = false;
		}}
	>
		<svelte:component this={$__userNotes.hasOwnProperty($__verseKey) ? NotesFilled : Notes} />
		<span>{term('verse')} Notes</span>
	</DropdownItem>

	<!-- verse translation button - only show on Mushaf page or on continuous display -->
	{#if selectableDisplays[$__displayType].continuous}
		<DropdownItem
			class={dropdownItemClasses}
			on:click={() => {
				__verseTranslationModalVisible.set(true);
				dropdownOpen = false;
			}}
		>
			<VerseTranslation />
			<span>{term('verse')} Translation</span>
		</DropdownItem>
	{/if}

	<!-- tafsir button -->
	<DropdownItem
		class={dropdownItemClasses}
		on:click={() => {
			__tafsirModalVisible.set(true);
			dropdownOpen = false;
		}}
	>
		<Tafsir />
		<span>{term('verse')} {term('tafsir')}</span>
	</DropdownItem>

	<!-- mode change buttons -->
	{#if $__currentPage === 'chapter'}
		<DropdownItem class={dropdownItemClasses} href="/page/{page}">
			<Book />
			<span>Mushaf Mode</span>
		</DropdownItem>
	{:else if $__currentPage === 'mushaf'}
		<DropdownItem class={dropdownItemClasses} href="/{$__verseKey.split(':')[0]}/{$__verseKey.split(':')[1]}">
			<ChapterMode />
			<span>{term('chapter')} Mode</span>
		</DropdownItem>
	{/if}

	<!-- verse morphology button -->
	<DropdownItem class={dropdownItemClasses} href="/morphology/{$__verseKey}">
		<Morphology />
		<span>{term('verse')} Morphology</span>
	</DropdownItem>

	<!-- share verse button -->
	<DropdownItem class={dropdownItemClasses} on:click={() => shareVerse()}>
		<Share />
		<span>Share {term('verse')}</span>
	</DropdownItem>
</Dropdown>
