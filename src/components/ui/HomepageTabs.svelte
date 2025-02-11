<script>
	import Mecca from '$svgs/Mecca.svelte';
	import Madinah from '$svgs/Madinah.svelte';
	import CrossSolid from '$svgs/CrossSolid.svelte';
	import AscendingSort from '$svgs/AscendingSort.svelte';
	import Moon from '$svgs/Moon.svelte';
	import Cave from '$svgs/Cave.svelte';
	import Tooltip from '$ui/FlowbiteSvelte/tooltip/Tooltip.svelte';
	import { updateSettings } from '$utils/updateSettings';
	import { quranMetaData, mostRead } from '$data/quranMeta';
	import { __lastRead, __favouriteChapters, __userBookmarks, __userNotes, __timeSpecificChapters, __siteNavigationModalVisible, __quranNavigationModalVisible, __learnModalVisible } from '$utils/stores';
	import { buttonClasses, buttonOutlineClasses } from '$data/commonClasses';
	import { checkTimeSpecificChapters } from '$utils/checkTimeSpecificChapters';
	import { term } from '$utils/terminologies';
	import { fetchVersesData } from '$utils/fetchData';
	import { splitDelimiter } from '$data/websiteSettings';
	import { reviewAll, learnFromChapter, getDueDatesByVerse, getProgressByChapter } from '$utils/learningScheduler';
	import { liveQuery } from 'dexie';

	// CSS classes for chapter cards and tabs
	const cardGridClasses = 'grid md:grid-cols-2 lg:grid-cols-3 gap-3';
	const cardInnerClasses = `flex justify-between md:text-left transition text-sm rounded-3xl p-5 hover:cursor-pointer border ${window.theme('border')} ${window.theme('hover')}`;

	// Tab classes
	const commontabClasses = 'p-2 md:p-3 text-xs md:text-md cursor-pointer border-b-4';
	const tabDefaultBorder = `${commontabClasses} border-transparent`;
	const tabActiveBorder = `${commontabClasses} ${window.theme('border')}`;

	let lastReadChapter = 1;
	let lastReadVerse = 1;
	let activeTab = 1; // Default to chapters tab
	let chapterSortIsAscending = true;
	let chapterListOrder = [...quranMetaData];

	// Reactive variable to update last read chapter and verse
	$: {
		if ($__lastRead.hasOwnProperty('key')) {
			[lastReadChapter, lastReadVerse] = $__lastRead.key.split(':').map(Number);
		}
	}

	// Reactive variable to fetch bookmarks data when on the bookmarks tab
	$: fetchData = activeTab === 3 && totalBookmarks !== 0 ? fetchVersesData({ verses: $__userBookmarks.toString(), fontType: 1 }) : null;
	$: totalBookmarks = $__userBookmarks.length;
	$: totalNotes = Object.keys($__userNotes).length;

	// Reactive variables to fetch review and learn data when relevant data changes
	let numberDue;
	$: dueDatesByVerse = liveQuery(async () => {
		return await getDueDatesByVerse();
	});
	function setNumberDue(dueDatesByVerse) {
		if (dueDatesByVerse) {
			numberDue = dueDatesByVerse.filter(dueDate => dueDate[2] < new Date()).length;
		}
	}
	$: setNumberDue($dueDatesByVerse);
	setInterval(() => {
		setNumberDue($dueDatesByVerse);
	}, 60 * 1000);

	$: progressByChapter = liveQuery(async() => {
		return await getProgressByChapter();
	})

	// Remove 'invisible' class from chapter icons once fonts are loaded
	document.fonts.ready.then(() => {
		document.querySelectorAll('.chapter-icons').forEach((element) => {
			element.classList.remove('invisible');
		});
	});

	// Check if it's Friday and nighttime
	checkTimeSpecificChapters();

	// Function to sort the chapter list in ascending or descending order
	function sortChapters() {
		chapterSortIsAscending = !chapterSortIsAscending;
		chapterListOrder = chapterSortIsAscending ? [...quranMetaData] : [...quranMetaData].reverse();

		// Ensure chapter icons are visible after sorting
		setTimeout(() => {
			document.querySelectorAll('.chapter-icons').forEach((element) => {
				element.classList.remove('invisible');
			});
		}, 10);
	}
</script>

<div id="homepage-tabs" style="margin-top: 0px;">
	<div class="flex items-center justify-center px-2 md:px-0 mb-4">
		<div class="flex flex-row justify-center px-4">
			<!-- main tabs -->
			<div id="tab-buttons">
				<div class="flex text-sm font-medium text-center justify-center space-x-1 md:space-x-4">
					<button on:click={() => (activeTab = 1)} class="{activeTab === 1 ? tabActiveBorder : tabDefaultBorder} flex flex-row space-x-2 items-center" type="button">
						<!-- asc/dsc sort button -->
						<div class="flex flex-row">
							<button class="inline-flex p-2 rounded-full items-center {window.theme('bgSecondaryDark')}" on:click={() => sortChapters()}>
								<span><AscendingSort size={3} /></span>
								<span class="sr-only">Sort</span>
							</button>
							<Tooltip arrow={false} type="light" placement="top" class="z-30 w-max hidden md:block font-normal">Sort Asc/Dsc</Tooltip>
						</div>
						<span>{term('chapters')}</span>
					</button>
					<button on:click={() => (activeTab = 2)} class={activeTab === 2 ? tabActiveBorder : tabDefaultBorder} type="button">Suggested</button>
					<button on:click={() => (activeTab = 3)} class="{activeTab === 3 ? tabActiveBorder : tabDefaultBorder} flex flex-row space-x-1 items-center truncate" type="button">
						<span>Bookmarks</span>
						<span class="hidden xs:block">{totalBookmarks > 0 ? `(${totalBookmarks})` : ''}</span>
					</button>
					<button on:click={() => (activeTab = 4)} class="{activeTab === 4 ? tabActiveBorder : tabDefaultBorder} flex flex-row space-x-1 items-center truncate" type="button">
						<span>Notes</span>
						<span class="hidden xs:block">{totalNotes > 0 ? `(${totalNotes})` : ''}</span>
					</button>
					<button on:click={() => (activeTab = 5)} class="{activeTab === 5 ? tabActiveBorder : tabDefaultBorder} flex flex-row space-x-1 items-center truncate" type="button">
						<span>Learn</span>
						<span class="hidden xs:block">{numberDue > 0 ? `(${numberDue})` : ''}</span>
					</button>
				</div>
			</div>
		</div>
	</div>

	<div class="hidden md:block h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent to-transparent opacity-20 -mt-4 mx-auto {window.theme('via')}"></div>

	<div id="content-tab" class="my-6 px-">
		<!-- chapters tab -->
		<div class="homepage-tab-panels {activeTab === 1 ? 'block' : 'hidden'}" id="chapters-tab-panel" role="tabpanel" aria-labelledby="chapters-tab">
			<!-- time specific chapters and continue reading button -->
			<div class="flex flex-row justify-between text-xs mb-2 space-x-1 md:space-x-2">
				<!-- time specific chapters buttons -->
				<!-- show Al Kahf on Friday -->
				{#if $__timeSpecificChapters.isFriday || $__timeSpecificChapters.isNight}
					<div class="flex flex-row space-x-1 md:space-x-2 w-full md:w-max">
						{#if $__timeSpecificChapters.isFriday}
							<div id="al-kahf" class="w-full md:w-max">
								<a href="/18" class="py-2.5 w-full truncate {buttonOutlineClasses}">
									<span class="mr-1 md:-mr-1 -mt-1"><Cave size={4} /></span>
									<span class="hidden md:block">It's Friday:&nbsp;</span>
									Al-Kahf
									<span class="hidden md:block">{@html '&#10230'}</span>
								</a>
							</div>
						{/if}

						<!-- show Al Mulk at night/evening -->
						{#if $__timeSpecificChapters.isNight}
							<div id="al-mulk" class="w-full md:w-max">
								<a href="/67" class="py-2.5 w-full truncate {buttonOutlineClasses}">
									<span class="mr-1 md:-mr-1"><Moon size={3.5} /></span>
									<span class="hidden md:block">Night Reminder:&nbsp;</span>
									Al-Mulk
									<span class="hidden md:block">{@html '&#10230'}</span>
								</a>
							</div>
						{/if}
					</div>
				{/if}

				<!-- continue reading button -->
				{#if $__lastRead.hasOwnProperty('key')}
					<div id="last-read" class="flex flex-row w-full md:w-max">
						<a href="/{lastReadChapter}/{lastReadVerse}" class="py-2.5 w-full truncate {buttonClasses} !space-x-0">
							<span class="hidden md:block">Continue Reading: {quranMetaData[lastReadChapter].transliteration}, {lastReadChapter}:{lastReadVerse} {@html '&#10230'}</span>
							<span class="block md:hidden">Continue: {lastReadChapter}:{lastReadVerse} </span>
						</a>
					</div>
				{/if}
			</div>

			<!-- surahs tab -->
			<div class="{cardGridClasses} grid-cols-2">
				{#each chapterListOrder as { id }, i}
					{#if id > 0}
						<a href="/{id}">
							<div class="{cardInnerClasses} flex-col-reverse md:flex-row text-center items-center">
								<div class="">
									<!-- chapter name and icon -->
									<div class="flex flex-row items-center space-x-1 justify-center md:justify-start truncate">
										<div>{id}. {quranMetaData[id].transliteration}</div>
										<div><svelte:component this={quranMetaData[id].revelation === 1 ? Mecca : Madinah} /></div>
										<Tooltip arrow={false} type="light" placement="top" class="z-30 hidden md:block font-normal">{quranMetaData[id].revelation === 1 ? term('meccan') : term('medinan')} revelation</Tooltip>
									</div>

									<!-- chapter translation -->
									<div class="block text-xs truncate opacity-70">
										{quranMetaData[id].translation}
									</div>

									<!-- chapter verses -->
									<div class="block text-xs opacity-70">
										{quranMetaData[id].verses}
										{term('verses')}
									</div>
								</div>
								<div class="invisible chapter-icons justify-items-end text-5xl" style="color: {window.theme('icon')}">{@html `&#xE9${quranMetaData[id].icon};`}</div>
							</div>
						</a>
					{/if}
				{/each}
			</div>
		</div>

		<!-- suggestions tab -->
		<div class="homepage-tab-panels space-y-12 {activeTab === 2 ? 'block' : 'hidden'}" id="suggestions-tab-panel" role="tabpanel" aria-labelledby="suggestions-tab">
			<div id="suggestions-chapters" class="flex flex-col space-y-4">
				<div class="{cardGridClasses} grid-cols-1">
					{#each Object.entries(mostRead) as [id, item]}
						<a href={item.url} class="!justify-start {cardInnerClasses} flex-col">
							<span class="text-sm">{quranMetaData[item.chapter].transliteration} ({item.verses})</span>
							<div class="block text-xs opacity-70">{item.title}</div>
						</a>
					{/each}
				</div>

				<div class="px-2 text-xs opacity-70">Suggestions listed here are based on the most frequently read chapters and verses by muslim audience, as well as virtues derived from Hadiths. While some Hadiths highlighting these virtues may be considered weak by some scholars, using them for beneficial knowledge is also a widely accepted opinion.</div>
			</div>
		</div>

		<!-- bookmarks tab -->
		<div class="bookmarks-tab-panels space-y-12 {activeTab === 3 ? 'block' : 'hidden'}" id="bookmarks-tab-panel" role="tabpanel" aria-labelledby="bookmarks-tab">
			<div id="bookmark-cards" class="flex flex-col space-y-4">
				{#if totalBookmarks === 0}
					<div class="flex items-center justify-center text-sm">You currently do not have any bookmarks.</div>
				{:else}
					<div class="{cardGridClasses} grid-cols-1">
						{#each $__userBookmarks as bookmark}
							<div class="flex flex-row space-x-2">
								<a href="{bookmark.split(':')[0]}/{bookmark.split(':')[1]}" class="!justify-start {cardInnerClasses} w-full flex-col">
									<div class="text-sm">{quranMetaData[bookmark.split(':')[0]].transliteration} ({bookmark})</div>

									{#if activeTab === 3 && totalBookmarks !== 0}
										<div class="text-sm truncate direction-rtl text-right arabic-font-1 opacity-70">
											{#await fetchData then data}
												{data[bookmark].words.arabic.split(splitDelimiter).join(' ')}
											{:catch error}
												<p></p>
											{/await}
										</div>
									{/if}
								</a>

								<!-- delete/cross button -->
								<button on:click={() => updateSettings({ type: 'userBookmarks', key: bookmark })} class="pointer h-7 w-7 opacity-100" style="margin-left: -20px; margin-top: -5px;" title="Remove bookmark"><CrossSolid size={7} /></button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- notes tab -->
		<div class="notes-tab-panels space-y-12 {activeTab === 4 ? 'block' : 'hidden'}" id="notes-tab-panel" role="tabpanel" aria-labelledby="notes-tab">
			<div id="notes-cards" class="flex flex-col space-y-4">
				{#if totalNotes === 0}
					<div class="flex items-center justify-center text-sm">You currently do not have any saved notes.</div>
				{:else}
					<div class="{cardGridClasses} grid-cols-1">
						{#each Object.entries($__userNotes) as [verse, note]}
							<a href="{verse.split(':')[0]}/{verse.split(':')[1]}" class="!justify-start {cardInnerClasses} w-full flex-col">
								<div class="text-sm">{quranMetaData[verse.split(':')[0]].transliteration} ({verse})</div>
								<span class="text-xs truncate opacity-70">{note.note}</span>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- learn tab -->
		<div class="learn-tab-panels space-y-12 {activeTab === 5 ? 'block' : 'hidden'}" id="learn-tab-panel" role="tabpanel" aria-labelledby="learn-tab">
			<div>
				<button
					class="py-1 w-full w-fit mr-2 mt-2 mb-6 {buttonClasses}" 
					on:click={() => {
						//TODO loading
						reviewAll()
					}}
					disabled={!numberDue}
				>	
					<h3 class="text-lg font-medium">Review - {numberDue ?? 0} due</h3>
				</button>

				<h3 class="text-xl font-semibold">Learn new verses</h3>

				{#if $progressByChapter}
				{#each [...quranMetaData] as { id }, i}
					{#if id > 0}
						<button
							class="py-1 w-full"
							on:click={() => {
								//TODO loading
								learnFromChapter(id)
							}}
							disabled={!$progressByChapter[id]?.unseen.length}
						>
							<div class="{cardInnerClasses} flex-col-reverse md:flex-row text-center items-center">
								<div class="flex justify-between w-full">
									<!-- chapter name and icon -->
									 <div>
										<!-- chapter name and icon -->
										<div class="flex flex-row items-center space-x-1 justify-center md:justify-start truncate">
											<div>{id}. {quranMetaData[id].transliteration}</div>
											<div><svelte:component this={quranMetaData[id].revelation === 1 ? Mecca : Madinah} /></div>
											<Tooltip arrow={false} type="light" placement="top" class="z-30 hidden md:block font-normal">{quranMetaData[id].revelation === 1 ? term('meccan') : term('medinan')} revelation</Tooltip>
										</div>

										<!-- chapter translation -->
										<div class="block text-xs truncate opacity-70">
											{quranMetaData[id].translation}
										</div>

										<!-- chapter verses -->
										<div class="block text-xs opacity-70">
											{quranMetaData[id].verses}
											{term('verses')}
										</div>
									</div>

									<div class="flex flex-row items-right w-32">
										<div class="text-right pr-2 w-10">
											{$progressByChapter[id]?.unseen.length ?? 0} <br>
											{$progressByChapter[id]?.learning.length ?? 0} <br>
											{$progressByChapter[id]?.acquired.length ?? 0} <br>
											{$progressByChapter[id]?.stable.length ?? 0} <br>
											{$progressByChapter[id]?.established.length ?? 0} <br>
										</div>
										<div class="text-left">
											Unseen <br>
											Learning <br>
											Acquired <br>
											Stable <br>
											Established <br>
										</div>
									</div>
								</div>
							</div>
						</button>
					{/if}
				{/each}
				{/if}
			</div>
		</div>
	</div>
</div>
