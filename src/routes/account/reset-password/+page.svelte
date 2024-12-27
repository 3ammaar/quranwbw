<script>
	import PageHead from '$misc/PageHead.svelte';
	import Password from '$svgs/Password.svelte';
    import Input from '$ui/FlowbiteSvelte/forms/Input.svelte';
	import { __currentPage, __pbAuth } from '$utils/stores';
    import { buttonClasses } from '$data/commonClasses';
    import { pb } from '$utils/pocketBaseDB';
    import { goto } from '$app/navigation';

    let loading = false;
    let errorMessage;
    let successMessage;

    let password = "";
    let confirmPassword = "";
    
    const params = new URLSearchParams(window.location.search);
    let token = params.get("token_hash");

    async function resetPassword() {
        if (password != confirmPassword) {
            errorMessage = "Confirmation password does not match.";
            return;
        }
        if (password.length < 8) {
            errorMessage = "Password error - Must be at least 8 character(s).";
            return;
        }
        if (password.length > 255) {
            errorMessage = "Password error - Must be at most 255 character(s).";
            return;
        }
        loading = true;
        errorMessage = null;
        
        const result = await pb.collection("users").confirmPasswordReset(
            token,
            password,
            confirmPassword
        ).catch(error => {
            errorMessage = "Unable to reset password. Please try again.";
            return;
        });

        if (result) {
            successMessage = "Your password has been reset successfully.";
        } else {
            errorMessage = "Unknown error."
        }
        
        loading = false;
    }
    __currentPage.set("reset-password")
</script>

<PageHead title={'Reset Password'} />

<div>
    <div class="flex justify-center">
        <div>
            <div class="w-full">
                {#if !successMessage}
                <form on:submit|preventDefault={() => resetPassword()}>
                    <div class="pt-1 pb-1">
                        <Input id="passwordInput" type="password" bind:value={password} placeholder={"Password"} size="md" class="bg-transparent rounded-3xl pl-10 px-8 {window.theme('placeholder')}">
                            <Password slot="left" size={7} classes="pl-2 pt-1 mr-3 {password.length > 0 && 'hidden'}" />
                        </Input>
                    </div>
                    <div class="pt-1 pb-1">
                        <Input id="confirmPasswordInput" type="password" bind:value={confirmPassword} placeholder={"Confirm Password"} size="md" class="bg-transparent rounded-3xl pl-10 px-8 {window.theme('placeholder')}">
                            <Password slot="left" size={7} classes="pl-2 pt-1 mr-3 {confirmPassword.length > 0 && 'hidden'}" />
                        </Input>
                    </div>
                    <div class="flex flex-row mt-4">
                        <button
                            on:click={() => resetPassword()}
                            class="w-full {buttonClasses}}"
                        >Reset Password</button>
                    </div>
                </form>
                {:else}
                <h4>{successMessage}</h4>
                <button
                    on:click={() => goto("/account")}
                    class="w-full mt-2 {buttonClasses}}"
                >Go to your account</button>
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
