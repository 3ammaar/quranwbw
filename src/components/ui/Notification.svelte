<script>
    import { flip } from "svelte/animate";
    import { fly } from "svelte/transition";
    import { __syncErrorNotificationVisible, __syncLoadingStates } from '$utils/stores';
    import { pb } from '$utils/pocketBaseDB';
	import CloseButton from '$ui/FlowbiteSvelte/utils/CloseButton.svelte';

    let isSyncing = false;
    let showSync = false;
    let showSuccess = false;
    let notifications = [];
    let errorDismissed = false;
    let syncDismissed = false;
    let successDismissed = false;
    
    $: {
        const states = Object.entries($__syncLoadingStates);
        if (states.length) {
            isSyncing = true;
            showSync = true;
        }
        else {
            const wasSynced = isSyncing;
            isSyncing = false;
            setTimeout(() => {
                const states = Object.entries($__syncLoadingStates);
                if (states.length) {
                    isSyncing = true;
                    showSync = true;
                }
                else {
                    isSyncing = false;
                    showSync = false;
                    if (wasSynced) {
                        showSuccess = true;
                        __syncErrorNotificationVisible.set(false);
                        setTimeout(() => {
                            showSuccess = false;
                        }, 3000);
                    }
                };
            }, 2000)
        };
    }

    $: {
        const visibleNotifications = [];
        if (pb.authStore?.isValid) {
            if ($__syncErrorNotificationVisible && !errorDismissed) {
                visibleNotifications.push({type: "error", message: "Syncing error - check your network connection and refresh the page to try again."})
            } else if (showSync && !syncDismissed) {
                visibleNotifications.push({type: "info", message: "Syncing..."});
            } else if (showSuccess && !successDismissed) {
                visibleNotifications.push({type: "success", message: "Synced successfully."})
            }
        }
        notifications = visibleNotifications;
    }

    function dismiss(type) {
        if (type == "error") {
            errorDismissed = true;
        } else if (type == "info") {
            syncDismissed = true;
        } else if (type == "success") {
            successDismissed = true;
        }
    }
</script>

<div class="flex flex-col justify-start items-center fixed top-2.5 left-0 right-0 z-[51]">
    {#each notifications as notification (notification.type)}
        <div
            animate:flip
            class="relative flex flex-shrink-0 flex-grow-0 mb-2 shadow rounded-2xl w-80 bg-{notification.type}"
            transition:fly={{ y: 30 }}
        >
            <CloseButton name="Close modal" class="absolute top-0 end-0" on:click={() => dismiss(notification.type)} />
            <div class="pl-4 pt-4 pr-7 pb-4 block text-sm b">{notification.message}</div>
        </div>
    {/each}
</div>
