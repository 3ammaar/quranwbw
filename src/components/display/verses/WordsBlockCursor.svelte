<script>
	import ArrowDown from '$svgs/ArrowDown.svelte';

	export let onCursorChange = () => {};
	export let color = "#000000";

	let selectedDraggable = null;
	let absoluteCursor = false;

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
			if (next != selectedDraggable && !selectedDraggable.contains(next)) {
				if (next) {
					next.insertBefore(selectedDraggable, null)
					absoluteCursor = true;
				} else {
					e.target.parentNode.insertBefore(selectedDraggable, null);
					absoluteCursor = false;
				}
				const newIndex = Array.from(e.target.parentNode.children)
					.filter((n) => n.classList.contains("cursor-word"))
					.indexOf(e.target) + 1;
				onCursorChange(newIndex);
			}
		}
		e.preventDefault();
	}

	function dragEnd() {
		selectedDraggable = null
	}

	function dragStart(e) {
		selectedDraggable = e.target
	}
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
	draggable="true"
	on:dragend={dragEnd} 
	on:dragstart={dragStart} 
	on:dragover={(e) => {e.preventDefault()}} 
	style="{
		absoluteCursor
			? "position: absolute; top: 0; right: 0; padding-right: 10px;"
			: "position: relative; margin-left: -5px; margin-right: 10px;"
	}"
	class="no-ghost"
>
	<div style="position: absolute; top: 0; left: 0;">
		<ArrowDown height="20px" width="20px" fill={color}/>
	</div>
</div>
