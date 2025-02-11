<script>
	import VerseOptionsDropdown from '$display/verses/VerseOptionsDropdown.svelte';
	import Word from '$display/verses/Word.svelte';
	import Tooltip from '$ui/FlowbiteSvelte/tooltip/Tooltip.svelte';
	import { goto } from '$app/navigation';
	import { selectableDisplays } from '$data/options';
	import { __currentPage, __fontType, __displayType, __userSettings, __audioSettings, __morphologyKey, __verseKey, __websiteTheme, __morphologyModalVisible } from '$utils/stores';
	import { loadFont } from '$utils/loadFont';
	import { wordAudioController } from '$utils/audioController';
	import { updateSettings } from '$utils/updateSettings';
	import { mushafWordFontLink, mushafFontVersion } from '$data/websiteSettings';

	export let key;
	export let value;
	export let line = null;
	export let exampleVerse = false;
	export let hiddenIndex = null;
	export let correctIndex = null;
	export let wordOnly = false;
	export let hasDraggableCursor = false;
	export let onCursorDragOver = null;
	export let hideVerseNumber = false;
	export let disablePointer = false;

	const fontSizes = JSON.parse($__userSettings).displaySettings.fontSizes;
	$: displayIsContinuous = selectableDisplays[$__displayType].continuous;

	// Dynamically load the fonts if mushaf fonts are selected
	if ([2, 3].includes($__fontType)) {
		loadFont(`p${value.meta.page}`, `${mushafWordFontLink}/QCF4${`00${value.meta.page}`.slice(-3)}_COLOR-Regular.woff?version=${mushafFontVersion}`).then(() => {
			// Hide the v4 words by default and show when the font is loaded...
			document.querySelectorAll(`.p${value.meta.page}`).forEach((element) => {
				element.classList.remove('invisible');
			});
		});
	}

	// Handle word clicks based on page type
	// 1. On morphology page, navigate to word's morphology
	// 2. On other pages, play word's audio
	// 3. On any page, show verse options dropdown for end verse icon
	function wordClickHandler(props) {
		// For morphology page
		if ($__currentPage === 'morphology' && props.type === 'word') {
			__morphologyKey.set(props.key);
			goto(`/morphology/${props.key}`, { replaceState: false });
		}

		// If the user clicks on a word in a non-Morphology page
		// else if ($__currentPage !== 'morphology' && props.type === 'word') {
		// 	__morphologyKey.set(props.key);
		// 	__morphologyModalVisible.set(true);
		// }

		// All other options
		else {
			__verseKey.set(props.key);
			if (props.type === 'word') {
				wordAudioController({
					key: props.key,
					chapter: +props.key.split(':')[0],
					verse: +props.key.split(':')[1]
				});
			} else if (props.type === 'end') {
				if (!displayIsContinuous)
					updateSettings({
						type: 'userBookmarks',
						key: props.key,
						set: true
					});
			}
		}
	}

	// Common classes for words and end icons
	$: wordAndEndIconCommonClasses = `
		hover:cursor-pointer
		${window.theme('hover')}
		${$__displayType === 1 ? 'text-center flex flex-col' : 'inline-flex flex-col'}
		${selectableDisplays[$__displayType].layout === 'wbw' ? 'p-3' : [2, 3].includes($__fontType) ? ($__currentPage === 'mushaf' ? 'p-0' : 'px-0 py-1') : 'p-1'}
		${exampleVerse && '!p-0'}
	`;

	// Classes for word spans
	$: wordSpanClasses = `
		arabicText leading-normal 
		arabic-font-${$__fontType} 
		${$__currentPage !== 'mushaf' && fontSizes.arabicText} 
		${displayIsContinuous && 'inline-block'}
	`;

	// Classes for v4 hafs words
	// If tajweed fonts were select, apply tajweed palette
	// But in Mocha Night & Dark Luxury themes, if non-tajweed fonts were selected, use custom palette to match theme
	$: v4hafsClasses = `
		invisible v4-words 
		p${value.meta.page} 
		${$__fontType === 3 ? 'theme-palette-tajweed' : 'theme-palette-normal'} 
		${$__fontType === 2 && $__websiteTheme === 5 ? 'mocha-night-font-color' : ''}
		${$__fontType === 2 && $__websiteTheme === 9 ? 'dark-luxury-font-color' : ''}
	`;

	// Classes for end icons
	// In Golden Glint theme, the end icon should be gold
	$: endIconClasses = `
		rounded-lg 
		${wordAndEndIconCommonClasses}
		${$__websiteTheme === 1 && `${window.theme('textSecondary')}`}
	`;
</script>

<style>
	.no-pointer, .no-pointer * {
		pointer-events: none;
	}

	.correct-word {
		border-bottom: thick green;
		border-bottom-style: solid;
	}

	.incorrect-word {
		border-bottom: thick red;
		border-bottom-style: solid;
	}
</style>

{#if hasDraggableCursor}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="cursor-word base-cursor-word relative w-5"
	on:dragover={onCursorDragOver}
/>
{/if}

<!-- words -->
{#each { length: value.meta.words } as _, word}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="relative cursor-word" on:dragover={onCursorDragOver}>
		<div 
			class="
				{(hasDraggableCursor || disablePointer) && "no-pointer"}
				{hasDraggableCursor && "ml-2"}
				{correctIndex !== null && word < correctIndex && "correct-word"}
				{correctIndex !== null && word == correctIndex && "incorrect-word"}
				{hiddenIndex !== null && word >= hiddenIndex && "invisible"}
			"
		>
			<Word {value} {word} {key} {line} {wordClickHandler} {wordAndEndIconCommonClasses} {wordSpanClasses} {v4hafsClasses} {exampleVerse} {wordOnly}/>
		</div>
		
		{#if hiddenIndex !== null}
		<div 
			class="
				{(hasDraggableCursor || disablePointer) && "no-pointer"}
				{word != hiddenIndex && "invisible"}
				absolute right-0 bottom-0 w-full h-full
			"
		>
			<div class="${wordAndEndIconCommonClasses} text-right print:break-inside-avoid">
				<span class={wordSpanClasses} data-fontSize={fontSizes.arabicText}>
					...
				</span>
			</div>
		</div>
		{/if}
	</div>
{/each}

<!-- end icon -->
{#if $__currentPage != 'mushaf' || ($__currentPage === 'mushaf' && value.words.end_line === line)}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="relative cursor-word final-cursor-word" on:dragover={onCursorDragOver}>
		<div
			class="
				{(hasDraggableCursor || disablePointer) && "no-pointer"}
				{correctIndex !== null && value.meta.words < correctIndex && "correct-word"}
				{correctIndex !== null && value.meta.words == correctIndex && "incorrect-word"}
				{hiddenIndex !== null && value.meta.words >= hiddenIndex && "invisible"}
			"
		>
			<div class={endIconClasses} on:click={() => wordClickHandler({ key, type: 'end' })}>
				<span class={wordSpanClasses} data-fontSize={fontSizes.arabicText}>
					
					<!-- 1: Uthmanic Hafs Digital, 3: Indopak Madinah -->
					{#if [1, 4].includes($__fontType)}
						{#if hideVerseNumber}
						<div>۝</div>
						{:else}
						{value.words.end}
						{/if}
						<!-- 2: Uthmanic Hafs Mushaf -->
					{:else if [2, 3].includes($__fontType)}
						<span style="font-family: p{value.meta.page}" class="{v4hafsClasses} custom-ayah-icon-color">
							{#if hideVerseNumber}
							<div>۝</div>
							{:else}
							{value.words.end}
							{/if}
						</span>
					{/if}
				</span>
			</div>

			{#if displayIsContinuous}
				<VerseOptionsDropdown page={value.meta.page} />
			{/if}

			<!-- end icon tooltip -->
			<Tooltip arrow={false} type="light" class="z-30 inline-flex font-sans font-normal">
				End of {key}
			</Tooltip>
		</div>

		{#if hiddenIndex !== null}
		<div 
			class="
				{(hasDraggableCursor || disablePointer) && "no-pointer"}
				{value.meta.words != hiddenIndex && "invisible"}
				absolute right-0 bottom-0 w-full h-full
			"
		>
			<div class="${wordAndEndIconCommonClasses} text-right print:break-inside-avoid">
				<span class={wordSpanClasses} data-fontSize={fontSizes.arabicText}>
					...
				</span>
			</div>
		</div>
		{/if}
	</div>
{/if}
