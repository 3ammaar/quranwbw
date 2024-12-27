<script>
	import PageHead from '$misc/PageHead.svelte';
    import Email from '$svgs/Email.svelte';
	import Password from '$svgs/Password.svelte';
    import Input from '$ui/FlowbiteSvelte/forms/Input.svelte';
	import { __currentPage, __pbAuth } from '$utils/stores';
    import { buttonClasses } from '$data/commonClasses';
    import { pb } from '$utils/pocketBaseDB'

    //TODO improve error handling, including error message management and content - this page and sub-pages
    //TODO improve styling - this page and sub-pages

    let loading = false;
    let errorMessage;
    let verificationMessage;
    let successMessage;
    let isSigningUp = false;
    let isChangingEmail = false;

    let email = "";
    let password = "";
    let confirmPassword = "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    async function signInWithEmail() {
        errorMessage = null;
        verificationMessage = null;
        successMessage = null;

        if (!email || !emailRegex.test(email)) {
            errorMessage = "Email error - Must be a valid email address.";
            return;
        }

        loading = true;
        const signedInUser = await pb.collection("users").authWithPassword(
            email,
            password,
        )
        .catch(error => {
            if (error.status == 400) {
                errorMessage = "Incorrect email and/or password.";
            }
            return;
        });

        if (!signedInUser && !errorMessage) {
            errorMessage = "Unknown error";
        }

        loading = false;
    }

    async function signUpWithEmail() {
        errorMessage = null;
        verificationMessage = null;
        successMessage = null;

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
        if (!email || !emailRegex.test(email)) {
            errorMessage = "Email error - Must be a valid email address.";
            return;
        }

        loading = true;

        const createdUser = await pb.collection("users").create({
            email: email,
            password: password,
            passwordConfirm: confirmPassword
        }).catch(error => {
            if (error.response?.status == 400) {
                const errorData = error.response?.data;
                if (errorData.email) {
                    if (errorData.email.code == "validation_not_unique") {
                        errorMessage = "Email error - An account with this email address already exists";
                    } else {
                        errorMessage = "Email error - " + errorData.email.message;
                    }
                } else if (errorData.password) {
                    errorMessage = "Password error - " + errorData.password.message;
                }
            } else if (error.response?.status == 429) {
                errorMessage = "Too many attempts. Please try again later.";
            }
            return;
        });

        if (createdUser && !errorMessage) {
            await pb.collection("users").requestVerification(email);
            await pb.collection("users").authWithPassword(email, password);

            verificationMessage = "Please check your inbox for email verification!";
        } else if (!errorMessage) {
            errorMessage = "Unknown error"
        }

        loading = false;
    }

    async function signOut() {
        loading = true;
        errorMessage = null;
        verificationMessage = null;
        successMessage = null;

        email = "";
        password = "";
        confirmPassword = "";
        
        pb.authStore.clear();

        loading = false;
    }

    async function resetPassword() {
        errorMessage = null;
        verificationMessage = null;
        successMessage = null;

        if ($__pbAuth.isValid) email = $__pbAuth.record.email;

        if (!email || !emailRegex.test(email)) {
            errorMessage = "Email error - Must be a valid email address.";
            return;
        }

        loading = true;
        
        const result = await pb.collection('users').requestPasswordReset(email)
            .catch(() => {
                errorMessage = "An unexpected error occurred. Please try again.";
            });
        
        if (result && !errorMessage) {
            verificationMessage = "A password reset request has been emailed to you.";
        }
        
        loading = false;
    }

    async function changeEmail() {
        errorMessage = null;
        verificationMessage = null;
        successMessage = null;

        if (!email || !emailRegex.test(email)) {
            errorMessage = "Email error - Must be a valid email address.";
            return;
        }

        loading = true;

        const response = await pb.collection("users")
            .requestEmailChange(email)
            .catch(error => {
                return;
            })
        
        if (response && !errorMessage) {
            verificationMessage = "Please check your inbox for email verification!";
        } else if (!errorMessage) {
            errorMessage = "Unknown error.";
        }

        loading = false;
    }

	__currentPage.set('account');
</script>

<PageHead title={'Account'} />

<div class="w-full">
    {#if successMessage}
    <div class="flex justify-center mt-8">
        <h4>{successMessage}</h4>
    </div>
    {/if}
    <div class="flex justify-center">
        <div>
            {#if $__pbAuth && $__pbAuth.isValid}
            <div class="flex flex-col justify-center">
                <div>
                    <h3>Signed in as {$__pbAuth.record.email}.</h3>
                </div>

                <div class="mt-8 mb-8">
                    {#if !$__pbAuth.record.verified}
                    <div >
                        <h3>Your email has not been verified. Your settings, bookmarks, notes and other data will not be synced until verified.</h3>

                        <div class="flex flex-row mt-4">
                            <div class="flex items-center text-center pr-6">
                                Need another verification email?
                            </div>
                            <button
                                on:click={() => {pb.collection("users").requestVerification($__pbAuth.record.email)}}
                                class="{buttonClasses}"
                            >Resend verification email</button>
                        </div>
                    </div>
                    {:else}
                    <div>
                        <h3>Your email has been verified.</h3>
                        <!-- <h3>Your settings, bookmarks, notes and other data will be synced to your account.</h3> -->
                    </div>
                    {/if}
                </div>

                {#if !isChangingEmail}
                <div class="flex flex-row mt-4">
                    <div class="flex items-center text-center pr-6">
                        Need to change email?
                    </div>
                    <button
                        on:click={() => {isChangingEmail = !isChangingEmail}}
                        class="{buttonClasses}"
                    >Change email address</button>
                </div>
                {:else}
                <div class="mt-8 inline md:flex md:text-center items-center flex-wrap">
                    <div class="md:text-center flex-shrink-0 pr-6 mb-2 md:mb-0">
                        Change email:
                    </div>
                    <div class="flex-shrink-0 grow md:mr-2 mb-2 md:mb-0">
                        <form>
                            <Input id="emailInput" type="email" bind:value={email} placeholder={"Email"} size="md" class="bg-transparent rounded-3xl {window.theme('placeholder')}">
                                <Email slot="left" size={7} classes="pl-2 pt-1 mr-3 {email.length > 0 && 'hidden'}" />
                            </Input>
                        </form>
                    </div>
                    <div class="flex flex-row">
                        <button
                            on:click={() => changeEmail()}
                            disabled={loading}
                            class="{buttonClasses} grow"
                        >Submit</button>
                        <button
                            on:click={() => isChangingEmail = !isChangingEmail}
                            disabled={loading}
                            class="{buttonClasses} ml-2 grow"
                        >Cancel</button>
                    </div>
                </div>
                {/if}

                {#if !isChangingEmail}
                <button
                    on:click={() => signOut()}
                    disabled={loading}
                    class="{buttonClasses} mt-4"
                >Sign out</button>

                <div class="flex flex-row mt-4">
                    <button
                        on:click={() => {resetPassword()}}
                        class="{buttonClasses}"
                    >Reset password</button>
                </div>
                {/if}
            </div>
            {:else}
            <div class="w-full">
                <form>
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
                </form>
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
