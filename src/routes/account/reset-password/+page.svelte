<script>
	import PageHead from '$misc/PageHead.svelte';
    import Spinner from '$svgs/Spinner.svelte';
	import Password from '$svgs/Password.svelte';
    import Input from '$ui/FlowbiteSvelte/forms/Input.svelte';
	import { __currentPage } from '$utils/stores';
    import { supabase } from '$lib/supabaseClient';
    import { buttonClasses } from '$data/commonClasses';

    let loading = false;
    let errorMessage = "";
    let success = false;

    let password = "";
    let confirmPassword = "";

    let currentSession;

    async function loadCurrentSession() {
        loading = true;
        errorMessage = "";

        const params = new URLSearchParams(window.location.search);
	    const tokenHash = params.get("token_hash");
        const type = params.get("type");

        if (type == "email") {
            const { data: { session }, error } = await supabase.auth.verifyOtp(
                { token_hash: tokenHash, type: 'email'}
            )

            if (error) {
                errorMessage = error.message;
            }
            if (session) {
                currentSession = session;
            }
        } else {
            errorMessage = "An error has occured. Try resetting your password again.";
        }

        loading = false;
    }

    supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") {
            currentSession = null;
        }
        else currentSession = session;
    })

    async function resetPassword() {
        if (password != confirmPassword) {
            errorMessage = "Confirmation password does not match.";
            return;
        }

        loading = true;
        errorMessage = null;

        const { data, error } = await supabase.auth.updateUser({
            password: password
        })
        
        if (error) {
            errorMessage = error.message;
        } else {
            success = true;
        }
        
        loading = false;
    }

    __currentPage.set("reset-password")
</script>

<PageHead title={'Reset Password'} />

<div>
    <div class="flex justify-center">
        <div>
            {#await loadCurrentSession()}
                <Spinner size="10" />
            {:then}
            {#if currentSession != null}
            <div class="w-full">
                {#if !success}
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
                {/if}
            </div>
            {/if}
            {/await}
        </div>
    </div>
    <div class="flex justify-center mt-8">
        {#if errorMessage}
        <h4>{errorMessage}</h4>
        {/if}
        {#if success}
        <h4>Your password has been successfully reset</h4>
        {/if}
    </div>
</div>