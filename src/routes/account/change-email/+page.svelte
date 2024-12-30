<script>
	import PageHead from '$misc/PageHead.svelte';
	import Password from '$svgs/Password.svelte';
    import Input from '$ui/FlowbiteSvelte/forms/Input.svelte';
	import { __currentPage, __pbAuth } from '$utils/stores';
    import { buttonClasses } from '$data/commonClasses';
    import { pb } from '$utils/pocketBaseDB';
    import { getTokenPayload } from 'pocketbase';
    import { goto } from '$app/navigation';

    let loading = false;
    let errorMessage;
    let successMessage;

    let password = "";
    
    const params = new URLSearchParams(window.location.search);
    let token = params.get("token_hash");
    const email = getTokenPayload(token).email;
    const newEmail = getTokenPayload(token).newEmail;

    async function changeEmail() {
        loading = true;
        errorMessage = null;
        
        const result = await pb.collection("users").authWithPassword(
            email,
            password,
        ).then(() => pb.collection("users").confirmEmailChange(
            token,
            password
        )).catch(error => {
            errorMessage = "Unable to confirm email change. Please try again.";
            return;
        });

        if (result) {
            successMessage = "Your email has been reset successfully.";
        } else {
            errorMessage = "Unknown error.";
        }
        
        loading = false;
    }
    __currentPage.set("change-email")
</script>

<PageHead title={'Change Email'} />

<div>
    <div class="flex justify-center">
        <div>
            <div class="w-full">
                {#if !email || !newEmail}
                <h3>An error has occurred. The email change link may be invalid. Please try again.</h3>
                {:else}
                {#if !successMessage}
                <form on:submit|preventDefault={() => {}}>
                    <h3>Re-enter your password to confirm your email change to {newEmail}</h3>
                    <div class="pt-1 pb-1 mt-2">
                        <Input id="passwordInput" type="password" bind:value={password} placeholder={"Password"} size="md" class="bg-transparent rounded-3xl pl-10 px-8 {window.theme('placeholder')}">
                            <Password slot="left" size={7} classes="pl-2 pt-1 mr-3 {password.length > 0 && 'hidden'}" />
                        </Input>
                    </div>
                    <div class="flex flex-row mt-4">
                        <button
                            on:click={() => changeEmail()}
                            class="w-full {buttonClasses}}"
                            type="submit"
                        >Confirm email change</button>
                    </div>
                </form>
                {:else}
                <h4>{successMessage}</h4>
                <button
                    on:click={() => goto("/account")}
                    class="w-full mt-2 {buttonClasses}}"
                >Go to your account</button>
                {/if}
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
