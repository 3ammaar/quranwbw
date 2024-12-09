<script>
	import ArrowDown from '$svgs/ArrowDown.svelte';
	import { onMount } from 'svelte';

	export let onCursorChange = () => {};
	export let color = "#000000";
	export let initialIndex = 0;

	let selectedDraggable = null;
	let finalWord = false;
	let cursor;

	function moveSelection(selectionNode, destinationNode) {
		finalWord = !destinationNode;
		if (finalWord) {
			destinationNode = document.getElementById("final-cursor-word");
		}
		if (destinationNode != selectionNode && !selectionNode.contains(destinationNode)) {
			destinationNode.insertBefore(selectionNode, null)
			const cursorWords = Array.from(destinationNode.parentNode.children)
				.filter((n) => n.classList.contains("cursor-word"));
			const newIndex = (destinationNode 
								? cursorWords.indexOf(destinationNode)
								: cursorWords.length) - (finalWord ? 0 : 1);
			onCursorChange(newIndex);
		}
	}

	export function setIndex(i) {
		let node = document.getElementById("base-cursor-word");
		const words = Array.from(node.parentNode.children)
			.filter((n) => n.classList.contains("cursor-word"));
		
		moveSelection(cursor, words.at(i + 1));
	}

	export function dragOver(e) {
		if (
			selectedDraggable
			&& e.target.nodeType == Node.ELEMENT_NODE 
			&& e.target.classList.contains("cursor-word")
		) {
			var next = e.target.nextElementSibling;
			while (next && !next.classList.contains("cursor-word")) {
				next = next.nextElementSibling;
			}
			moveSelection(selectedDraggable, next);
		}
		e.preventDefault();
	}

	function dragEnd() {
		selectedDraggable = null
	}

	function dragStart(e) {
		selectedDraggable = e.target
	}

	onMount(() => {setIndex(initialIndex)});
</script>

<style>
	.no-ghost {
		-webkit-touch-callout: none !important;
		-webkit-user-select: none !important;
		-webkit-user-drag: none !important;
		-khtml-user-select: none !important;
		-moz-user-select: none !important;
		-ms-user-select: none !important;
		user-select: none !important;
	}
</style>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	bind:this={cursor}
	draggable="true"
	on:dragend={dragEnd} 
	on:dragstart={dragStart} 
	on:dragover={(e) => {e.preventDefault()}} 
	style="{finalWord ? "left: 0;" : "right: 0;"} position: absolute; top: 0; padding-right: 10px;"
	class="no-ghost"
>
	<div style="position: absolute; top: 0; left: 0;">
		<ArrowDown height="20px" width="20px" fill={color}/>
	</div>
</div>
