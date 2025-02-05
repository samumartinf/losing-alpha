<script lang="ts">
	import UserAuthForm from '$lib/components/user-auth-form.svelte';
	import { Button } from "$lib/components/ui/button";

</script>

<div
	class="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0"
>
	<Button
		href={'/'}
		variant="ghost"
		class="absolute right-4 top-4 md:right-8 md:top-8"
	>
		Go back	
	</Button>
	<div class="bg-slate-900 dark:bg-slate-50 relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
		<div class="relative z-20 flex items-center text-lg font-medium">
			<!-- <Command class="mr-2 h-6 w-6" /> -->
			FleeceFund Inc	
		</div>
		<div class="relative z-20 mt-auto">
			<blockquote class="space-y-2">
				<p class="text-lg">
					&ldquo;Since I signed up, I have continued to lose alpha, but my dashboards are way more interesting now. &rdquo;
				</p>
				<footer class="text-sm">Hedge Bezos</footer>
			</blockquote>
		</div>
	</div>
	<div class="lg:p-8">
		<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
			<div class="flex flex-col space-y-2 text-center">
				<h1 class="text-2xl font-semibold tracking-tight">Create an account</h1>
				<p class="text-muted-foreground text-sm">
					Enter your email below to create your account
				</p>
			</div>
			<UserAuthForm />
			<p class="text-muted-foreground px-8 text-center text-sm">
				By clicking continue, you agree to our
				<a href="/terms" class="hover:text-primary underline underline-offset-4">
					Terms of Service
				</a>
				and
				<a href="/privacy" class="hover:text-primary underline underline-offset-4">
					Privacy Policy
				</a>
				.
			</p>
		</div>
	</div>
</div>