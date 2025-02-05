<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';

	let { form } = $props<{ form?: { message?: string } }>();
</script>

<form method="post" action="?/login" use:enhance>
	<div class="grid gap-4">
		<div class="grid gap-2">
			<label for="username" class="text-sm font-medium leading-none">Username</label>
			<input
				id="username"
				name="username"
				type="text"
				class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			/>
		</div>
		<div class="grid gap-2">
			<label for="password" class="text-sm font-medium leading-none">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			/>
		</div>
		<Button type="submit" class="w-full">Login</Button>
		<Button type="submit" formaction="?/register" variant="outline" class="w-full">Register</Button>
	</div>
	{#if form?.message}
		<p class="mt-4 text-sm text-destructive">{form.message}</p>
	{/if}
</form>

