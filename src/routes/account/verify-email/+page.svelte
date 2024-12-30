<script>
	import PageHead from '$misc/PageHead.svelte';
	import { __currentPage, __pbAuth } from '$utils/stores';
    import { buttonClasses } from '$data/commonClasses';
    import { pb } from '$utils/pocketBaseDB';
    import { getTokenPayload } from 'pocketbase';
    import { goto } from '$app/navigation';

    let loading = false;
    let errorMessage;
    let successMessage;

    const params = new URLSearchParams(window.location.search);
    let token = params.get("token_hash");
    console.log(getTokenPayload(token));

    verify();
    async function verify() {
        loading = true;
        errorMessage = null;
        
        const result = await pb.collection("users").confirmVerification(token)
            .catch(error => {
                if (error.status == 401) {
                    errorMessage = "Invalid verification link. Please try again or request another verificaiton email."
                }
                else errorMessage = "Unknown error when attempting to verify your email. Please try again or request another verificaiton email.";
                return;
            });
        if (result && !errorMessage) {
            successMessage = "Your email address has been verified successfully."
        } else if (!errorMessage) {
            errorMessage = "Unknown error."
        }
        
        loading = false;
    }
    __currentPage.set("verify-email")
</script>

<PageHead title={'Verify Email'} />

<div>
    <div class="flex justify-center">
        <div>
            <div class="w-full">
                {#if successMessage}
                <h4>{successMessage}</h4>
                <button
                    on:click={() => goto("/account")}
                    class="w-full mt-2 {buttonClasses}}"
                >Go to your account</button>
                {:else}
                <h3>An error has occurred. The email verification link may be invalid. Please try again.</h3>
                {/if}
            </div>
        </div>
    </div>
    <div class="flex justify-center mt-8">
        {#if errorMessage}
        <h4>{errorMessage}</h4>
        {/if}
    </div>
</div>
