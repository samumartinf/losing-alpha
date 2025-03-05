<script lang="ts">
	import { isAuthenticated } from '$lib/stores/auth';
	
	/**
	 * Content to show when user is not authenticated
	 */
	let { fallback = null, children } = $props();
	
	// Subscribe to the isAuthenticated store
	let isAuth = false;
	isAuthenticated.subscribe(value => {
		isAuth = value;
	});
</script>

{#if isAuth}
	{@render children()}
{:else if fallback}
	{@render fallback()}
{/if} 