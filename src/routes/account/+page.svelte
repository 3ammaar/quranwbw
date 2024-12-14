<script>
	import PageHead from '$misc/PageHead.svelte';
    import Spinner from '$svgs/Spinner.svelte';
    import Email from '$svgs/Email.svelte';
	import Password from '$svgs/Password.svelte';
    import Input from '$ui/FlowbiteSvelte/forms/Input.svelte';
	import { __currentPage } from '$utils/stores';
    import { supabase } from '$lib/supabaseClient';
    import { buttonClasses } from '$data/commonClasses';


    let loading = false;
    let errorMessage;
    let verificationMessage;

    let isSigningUp = false;

    let email = '';
    let password = '';
    let confirmPassword = '';

    let currentSession;

    let loadCurrentSession = supabase.auth.getSession().then(({ data: { session } }) => {
        currentSession = session;
    })

    supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") {
            currentSession = null;
        }
        else currentSession = session;
    })
    
    async function signInWithEmail() {
        loading = true;
        errorMessage = null;
        verificationMessage = null;

        const { 
            data: { session },
            error
        } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) {
            errorMessage = error.message;
        }

        loading = false;
    }

    async function signUpWithEmail() {
        if (password != confirmPassword) {
            errorMessage = "Confirmation password does not match.";
            return;
        }

        loading = true;
        errorMessage = null;
        verificationMessage = null;

        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        if (error) {
            errorMessage = error.message;
        }
        else if (!session) {
            verificationMessage = 'Please check your inbox for email verification!';
        }

        loading = false;
    }

    async function signOut() {
        loading = true;
        errorMessage = null;
        verificationMessage = null;

        const { error } = await supabase.auth.signOut();
        
        if (error) {
            errorMessage = error.message;
        }

        loading = false;
    }

    async function resetPassword() {
        loading = true;
        errorMessage = null;
        verificationMessage = null;

        const { error } = await supabase.auth.resetPasswordForEmail(email);
        
        if (error) {
            errorMessage = error.message;
        } else {
            verificationMessage = "A reset link has been sent to your email"
        }
        
        loading = false;
    }

	__currentPage.set('account');
</script>

<PageHead title={'Account'} />

<div class="w-full">
    <div class="flex justify-center">
        <div>
            {#await loadCurrentSession}
                <Spinner size="10" />
            {:then}
            {#if currentSession != null}
            
            <div class="flex flex-col justify-center">
                <div>
                <h3>Signed in as {currentSession.user.email}.</h3>
                </div>
                
                <button
                    on:click={() => signOut()}
                    disabled={loading}
                    class="{buttonClasses} mt-4"
                >Sign out</button>
            </div>
            {:else}
            <div class="w-full">
                <div class="pt-1 pb-1 mt-4">
                    <Input id="emailInput" type="email" bind:value={email} placeholder={"Email"} size="md" class="bg-transparent rounded-3xl pl-10 px-8 {window.theme('placeholder')}">
                        <Email slot="left" size={7} classes="pl-2 pt-1 mr-3 {email.length > 0 && 'hidden'}" />
                    </Input>
                </div>
                <div class="pt-1 pb-1">
                    <Input id="passwordInput" type="password" bind:value={password} placeholder={"Password"} size="md" class="bg-transparent rounded-3xl pl-10 px-8 {window.theme('placeholder')}">
                        <Password slot="left" size={7} classes="pl-2 pt-1 mr-3 {password.length > 0 && 'hidden'}" />
                    </Input>
                </div>
                {#if isSigningUp}
                <div class="pt-1 pb-1">
                    <Input id="confirmPasswordInput" type="password" bind:value={confirmPassword} placeholder={"Confirm Password"} size="md" class="bg-transparent rounded-3xl pl-10 px-8 {window.theme('placeholder')}">
                        <Password slot="left" size={7} classes="pl-2 pt-1 mr-3 {confirmPassword.length > 0 && 'hidden'}" />
                    </Input>
                </div>
                {/if}
                <div class="flex flex-row mt-4">
                    <button
                        on:click={() => isSigningUp ? signUpWithEmail() : signInWithEmail()}
                        class="w-full mr-2 {buttonClasses}"
                    >{isSigningUp ? "Sign up" : "Sign in"}</button>
                </div>
                <div class="flex flex-row mt-4">
                    <div class="flex items-center text-center pr-6">
                        {isSigningUp ? "Have an account?" : "Need an account?"}
                    </div>
                    <button
                        on:click={() => {isSigningUp = !isSigningUp}}
                        class="{buttonClasses}"
                    >{isSigningUp ? "Sign in instead" : "Sign up instead"}</button>
                </div>
                <div class="flex flex-row mt-4">
                    <div class="flex items-center text-center pr-6">Forgot your password?</div>
                    <button
                        on:click={() => {resetPassword()}}
                        class="{buttonClasses}"
                    >Reset password</button>
                </div>
            </div>
            {/if}
            {/await}
        </div>
    </div>
    <div class="flex justify-center mt-8">
        {#if errorMessage}
        <h4>{errorMessage}</h4>
        {/if}
        {#if verificationMessage}
        <h4>{verificationMessage}</h4>
        {/if}
    </div>
</div>
